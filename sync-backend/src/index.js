/**
 * ARIA Sync Backend
 * Cross-device synchronization service with Socket.io
 * Listens on localhost:8002
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY || 'aria-secret-2024';

// In-memory storage (replace with database in production)
const devices = new Map(); // device_id -> { name, type, online, socket_id }
const users = new Map(); // user_id -> { devices: [], last_active }
const messages = []; // Chat history
const connections = new Map(); // socket_id -> { device_id, user_id }

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'aria-sync-backend',
    connected_devices: devices.size,
  });
});

// Device Registration
app.post('/api/devices/register', (req, res) => {
  try {
    const { device_name, device_type, os_version } = req.body;

    if (!device_name || !device_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user_id = 'user_' + Math.random().toString(36).substr(2, 9);
    const device_id = 'device_' + Math.random().toString(36).substr(2, 9);
    const auth_token = jwt.sign({ device_id, user_id }, SECRET_KEY, { expiresIn: '24h' });

    devices.set(device_id, {
      id: device_id,
      name: device_name,
      type: device_type,
      os_version,
      user_id,
      online: false,
      registered_at: new Date(),
    });

    if (!users.has(user_id)) {
      users.set(user_id, {
        id: user_id,
        devices: [device_id],
        created_at: new Date(),
      });
    } else {
      users.get(user_id).devices.push(device_id);
    }

    res.json({
      device_id,
      user_id,
      auth_token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List devices
app.get('/api/devices/list', (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id || !users.has(user_id)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users.get(user_id);
    const deviceList = user.devices.map(id => devices.get(id)).filter(Boolean);

    res.json({
      devices: deviceList.map(d => ({
        device_id: d.id,
        device_name: d.name,
        device_type: d.type,
        online: d.online,
        last_seen: d.last_seen,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Device authentication
  socket.on('auth', (data) => {
    try {
      const { auth_token, device_id } = data;

      const decoded = jwt.verify(auth_token, SECRET_KEY);

      if (decoded.device_id !== device_id) {
        socket.emit('auth_failed', { error: 'Invalid device ID' });
        return;
      }

      const device = devices.get(device_id);
      if (!device) {
        socket.emit('auth_failed', { error: 'Device not found' });
        return;
      }

      // Register connection
      connections.set(socket.id, {
        device_id,
        user_id: decoded.user_id,
      });

      device.online = true;
      device.socket_id = socket.id;

      socket.emit('auth_success', {
        device_id,
        user_id: decoded.user_id,
      });

      // Join user room
      socket.join(`user_${decoded.user_id}`);

      // Broadcast online status
      io.to(`user_${decoded.user_id}`).emit('device_online', {
        device_id,
        device_name: device.name,
      });

      console.log(`Device authenticated: ${device_id}`);
    } catch (error) {
      socket.emit('auth_failed', { error: 'Authentication failed' });
    }
  });

  // Chat message
  socket.on('chat:message', (data) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    const message = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      user_id: conn.user_id,
      device_id: conn.device_id,
      content: data.content,
      timestamp: new Date(),
    };

    messages.push(message);

    // Broadcast to all user's devices
    io.to(`user_${conn.user_id}`).emit('chat:new_message', message);
  });

  // System command
  socket.on('command:system', (data) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    const command = {
      id: 'cmd_' + Math.random().toString(36).substr(2, 9),
      user_id: conn.user_id,
      source_device: conn.device_id,
      target_device: data.target_device,
      command: data.command,
      data: data.data,
      timestamp: new Date(),
    };

    // Find target device and forward command
    const targetDevice = devices.get(data.target_device);
    if (targetDevice && targetDevice.socket_id) {
      io.to(targetDevice.socket_id).emit('command:execute_system', command);
    }
  });

  // Command result
  socket.on('command:result', (data) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    io.to(`user_${conn.user_id}`).emit('command:system_result', {
      command_id: data.command_id,
      success: data.success,
      result: data.result,
    });
  });

  // File sync
  socket.on('file:list', (data) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    const command = {
      id: 'cmd_' + Math.random().toString(36).substr(2, 9),
      type: 'file_list',
      path: data.path,
      timestamp: new Date(),
    };

    const targetDevice = devices.get(data.target_device);
    if (targetDevice && targetDevice.socket_id) {
      io.to(targetDevice.socket_id).emit('file:list_request', command);
    }
  });

  // File list result
  socket.on('file:list_result', (data) => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    io.to(`user_${conn.user_id}`).emit('file:list_response', {
      command_id: data.command_id,
      files: data.files,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const conn = connections.get(socket.id);
    if (!conn) return;

    const device = devices.get(conn.device_id);
    if (device) {
      device.online = false;
      device.last_seen = new Date();

      // Broadcast offline status
      io.to(`user_${conn.user_id}`).emit('device_offline', {
        device_id: conn.device_id,
        device_name: device.name,
      });
    }

    connections.delete(socket.id);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = 8002;
server.listen(PORT, () => {
  console.log(`ARIA Sync Backend running on http://localhost:${PORT}`);
});

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Device {
  id: string;
  name: string;
  type: 'laptop' | 'tablet' | 'mobile';
  status: 'online' | 'offline' | 'sync';
  lastSeen: Date;
  batteryLevel?: number;
  location?: string;
}

interface DeviceContextType {
  devices: Device[];
  currentDevice: Device;
  syncStatus: 'synced' | 'syncing' | 'error';
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  syncDevices: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

function detectDeviceType(): 'laptop' | 'tablet' | 'mobile' {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'laptop';
}

function generateDeviceId(): string {
  return 'device_' + Math.random().toString(36).substr(2, 9);
}

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  const currentDevice: Device = {
    id: generateDeviceId(),
    name: `My ${detectDeviceType()}`,
    type: detectDeviceType(),
    status: 'online',
    lastSeen: new Date(),
    batteryLevel: Math.floor(Math.random() * 100),
  };

  useEffect(() => {
    // Initialize with current device and some mock devices
    const mockDevices: Device[] = [
      currentDevice,
      {
        id: 'device_laptop_001',
        name: 'MacBook Pro',
        type: 'laptop',
        status: 'online',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
        batteryLevel: 87,
        location: 'Home Office',
      },
      {
        id: 'device_mobile_001',
        name: 'iPhone 15',
        type: 'mobile',
        status: 'sync',
        lastSeen: new Date(Date.now() - 2 * 60 * 1000),
        batteryLevel: 64,
        location: 'Living Room',
      },
      {
        id: 'device_tablet_001',
        name: 'iPad Pro',
        type: 'tablet',
        status: 'offline',
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        batteryLevel: 23,
        location: 'Bedroom',
      },
    ];
    
    setDevices(mockDevices);
  }, []);

  const addDevice = (device: Device) => {
    setDevices(prev => [...prev, device]);
  };

  const updateDevice = (id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(device => 
      device.id === id ? { ...device, ...updates } : device
    ));
  };

  const syncDevices = async () => {
    setSyncStatus('syncing');
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update device statuses
    setDevices(prev => prev.map(device => ({
      ...device,
      status: Math.random() > 0.1 ? 'online' : 'offline',
      lastSeen: new Date(),
    })));
    
    setSyncStatus('synced');
  };

  const contextValue: DeviceContextType = {
    devices,
    currentDevice,
    syncStatus,
    addDevice,
    updateDevice,
    syncDevices,
  };

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within DeviceProvider');
  }
  return context;
};
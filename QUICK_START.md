# ARIA Quick Start Guide

**TL;DR** - Get ARIA running in 15 minutes

## 🚀 Express Setup (All Phases)

### Prerequisites
- Node.js 16+
- Python 3.8+
- Rust (for desktop app): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Optional: Ollama for local AI

### Installation

**Step 1: Clone/Setup ARIA**
```bash
cd ARIA
npm install
```

**Step 2: Start Services** (Open 4 terminals)

Terminal 1 - Python AI Backend:
```bash
cd python-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Terminal 2 - Browser Automation (optional):
```bash
cd browser-automation
npm install
npm start
```

Terminal 3 - Device Sync Backend (optional):
```bash
cd sync-backend
npm install
npm start
```

Terminal 4 - Desktop App:
```bash
npm run tauri:dev
```

**Step 3: Optional - Ollama for Local AI**
```bash
# Download from https://ollama.ai
ollama serve
# In another window:
ollama pull llama2
```

### That's it! 🎉

Visit `http://localhost:5173` or wait for the Tauri window to open.

---

## 📱 Quick Test

1. **Chat with AI**: Type a message in the chat box
   - Should see response with 🟢 (local) or 🟠 (cloud) indicator

2. **System Control**: Click "System" tab
   - View real CPU, memory, disk usage
   - See running processes
   - Check command history

3. **Monitor Performance**: View graphs and health score

---

## 🔧 Configuration

### Use Cloud AI (Faster)

Edit `python-backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

Get key: https://platform.openai.com/api-keys

### Use Local AI (Private, Free)

Install Ollama: https://ollama.ai

```bash
ollama pull llama2
ollama serve
```

---

## 🌐 Access Services

- **Desktop App**: http://localhost:5173 or Tauri window
- **AI Backend**: http://localhost:8000/health
- **Browser Automation**: http://localhost:8001/health
- **Device Sync**: http://localhost:8002/health

---

## 📊 Features

**Phase 1: AI**
- ✅ Chat with real AI (local or cloud)
- ✅ See which model responded
- ✅ Voice input/output

**Phase 2: System Control**
- ✅ Real-time CPU/memory/disk monitoring
- ✅ Process management
- ✅ File operations
- ✅ Command audit log

**Phase 3: Browser Automation** (if started)
- ✅ Control Chrome
- ✅ Automate form filling
- ✅ Extract page content
- ✅ Screenshot capture

**Phase 4: Mobile Sync** (if started)
- ✅ Register devices
- ✅ Cross-device message sync
- ✅ Remote command execution

**Free Features**
- ✅ Performance graphs
- ✅ Alert system
- ✅ Command favorites
- ✅ Health scoring

---

## 🐛 Troubleshooting

**"Connection refused"**
```bash
# Check services are running
curl http://localhost:8000/health
```

**"No AI response"**
- Make sure Python backend is running: `python app.py`
- Check logs in terminal

**"Ollama not working"**
- Install from https://ollama.ai
- Start with: `ollama serve`
- Pull model: `ollama pull llama2`

**"App won't build"**
```bash
# Reinstall Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
npm run tauri:dev
```

---

## 📚 Full Documentation

See `COMPLETE_IMPLEMENTATION_GUIDE.md` for:
- Architecture details
- API reference
- Advanced configuration
- Phase descriptions
- Deployment guide

---

## 💡 Next Steps

1. **Play with Chat**: Test different AI models
2. **Monitor System**: Check real-time performance
3. **Explore Browser Automation**: Automate web tasks
4. **Prepare Mobile**: iOS/Android app scaffolding ready

---

## 🎯 Performance Tips

**Faster Responses:**
- Use Ollama with GPU acceleration (NVIDIA CUDA)
- Or use OpenAI GPT-4 (better quality)

**Lighter Load:**
- Use smaller models: `mistral`, `neural-chat`
- Disable browser automation if not needed
- Reduce monitoring refresh rate

**Mobile Sync:**
- Local network deployment (recommended)
- Or use cloud with encryption

---

## 📦 Project Structure

```
ARIA/
├── src/                          # React frontend
│   ├── components/
│   │   ├── ChatInterface.tsx     # Chat UI
│   │   ├── SystemControlPanel.tsx # System control
│   │   ├── MonitoringDashboard.tsx # Performance
│   │   └── QuickCommands.tsx     # Command favorites
│   ├── contexts/
│   │   ├── AssistantContext.tsx  # AI state
│   │   └── SystemContext.tsx     # System state
│   └── utils/
│       └── tauriUtils.ts         # IPC wrappers
│
├── src-tauri/                    # Tauri backend
│   ├── src/
│   │   ├── main.rs              # IPC commands
│   │   ├── ai.rs                # AI coordination
│   │   └── system.rs            # System control
│   └── Cargo.toml
│
├── python-backend/               # AI service
│   ├── app.py                    # FastAPI server
│   ├── ollama_service.py
│   └── openai_service.py
│
├── browser-automation/           # Browser control
│   └── src/index.js
│
├── sync-backend/                 # Cross-device sync
│   └── src/index.js
│
└── mobile-apps/                  # Mobile scaffolding
    ├── iOS/
    └── Android/
```

---

## ⚡ Commands Reference

```bash
# Development
npm run tauri:dev          # Run with hot reload

# Build
npm run tauri:build        # Build executable

# Testing
curl http://localhost:8000/health    # Check AI
curl http://localhost:8001/health    # Check browser
curl http://localhost:8002/health    # Check sync

# Logs
# Frontend: Browser F12
# Backend: Terminal output
```

---

## 🔐 Security Notes

- All services run on localhost (local network only)
- API keys stored in environment variables
- System operations logged
- Protected processes cannot be killed
- File operations require full path

---

## 📞 Support

**Common Issues:**

1. Services not starting?
   - Check terminal for errors
   - Verify Python 3.8+ installed
   - Verify Node.js 16+ installed

2. "Tauri not available"?
   - Running in web mode (expected without desktop app)
   - Install Rust: https://rustup.rs

3. No AI response?
   - Check Python backend running
   - Check firewall not blocking localhost:8000

---

## 🎮 Try These Commands

In the chat, try:
- "What's my CPU usage?" → Shows real stats
- "List my processes" → Shows running apps
- "How much disk space?" → Shows storage
- "Open Chrome" → Launches browser
- "Monitor system" → Shows performance

---

## 🚢 Ready to Go!

ARIA is now running with:
- ✅ Real AI integration
- ✅ System control
- ✅ Browser automation
- ✅ Mobile sync ready
- ✅ Advanced monitoring
- ✅ Command history
- ✅ Security features

Enjoy your personal AI assistant! 🤖

---

**Questions?** See `COMPLETE_IMPLEMENTATION_GUIDE.md` for detailed documentation.

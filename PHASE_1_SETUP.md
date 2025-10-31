# ARIA Phase 1: Real AI Integration - Setup Guide

This guide walks you through setting up Phase 1 of ARIA - converting from a web prototype to a Tauri desktop app with real AI integration.

## What's New in Phase 1

✅ **Tauri Desktop App** - Native application with OS access (Rust backend)
✅ **Real AI Models** - Local models via Ollama or cloud APIs (OpenAI/Anthropic)
✅ **FastAPI Backend** - Python server for AI inference on localhost:8000
✅ **Streaming UI** - Chat interface shows AI source (local/cloud) and latency
✅ **Fallback Support** - Automatic fallback from local to cloud if local model unavailable

## Architecture

```
┌──────────────────────────────────────────────┐
│  ARIA Desktop App (Tauri + React)            │
│  ├─ src/components/ChatInterface.tsx         │
│  ├─ src/contexts/AssistantContext.tsx        │
│  └─ src/utils/tauriUtils.ts                  │
└──────────────┬───────────────────────────────┘
               │
               ├─ Tauri IPC (invokeXXX commands)
               │
          ┌────┴────────────────────────────┐
          ↓                                  ↓
  ┌──────────────────────────┐   ┌─────────────────────┐
  │  Tauri Rust Backend      │   │  Python Backend     │
  │  (src-tauri/src/)        │   │  (python-backend/)  │
  │  ├─ main.rs             │   │  ├─ app.py          │
  │  ├─ ai.rs               │   │  ├─ ollama_service  │
  │  └─ system.rs           │   │  └─ openai_service  │
  │                          │   │  (localhost:8000)   │
  └──────────────────────────┘   └─────────────────────┘
                                          │
                              ┌───────────┴──────────┐
                              ↓                      ↓
                        ┌──────────────┐    ┌──────────────────┐
                        │  Ollama      │    │  Cloud APIs      │
                        │ (localhost   │    │  OpenAI/Anthropic│
                        │  :11434)     │    │  (api.openai.com)│
                        └──────────────┘    └──────────────────┘
```

## Prerequisites

### Required

- **Node.js 16+** - For React/TypeScript development
- **npm** - Package manager
- **Rust toolchain** - For Tauri desktop app
  - Install via: https://rustup.rs/

### Optional (For local AI)

- **Ollama** - Local LLM server (https://ollama.ai)
- **GPU** - NVIDIA/AMD GPU recommended for fast local inference

### Optional (For cloud AI)

- **OpenAI API Key** - Get from https://platform.openai.com/api-keys
- **Anthropic API Key** - Get from https://console.anthropic.com

## Step-by-Step Setup

### Step 1: Install Rust Toolchain

Required for building the Tauri desktop app.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Verify installation:
```bash
rustc --version
cargo --version
```

### Step 2: Install Tauri CLI

From the ARIA directory:

```bash
npm install
# Tauri CLI is already in devDependencies
```

### Step 3: Start Python Backend

Open a new terminal in the ARIA directory:

```bash
cd python-backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Keep this terminal open.

### Step 4: (Optional) Start Ollama for Local AI

Open another terminal:

```bash
# If installed via package manager or direct download:
ollama serve

# Or visit https://ollama.ai to download
```

First time setup:
```bash
# Pull a model (llama2 is recommended for Phase 1)
ollama pull llama2
```

You should see:
```
✓ Pulling model
✓ Verifying sha256 digest
```

If you skip this step, only cloud AI will be available.

### Step 5: Build and Run Tauri Desktop App

In the ARIA directory (new terminal):

```bash
# Development mode with hot reload
npm run tauri dev
```

This will:
1. Start Vite dev server (hot reload)
2. Build Tauri backend (Rust)
3. Open desktop window

The first build may take 5-15 minutes (compiling Rust).

Once running, you should see the ARIA desktop app window.

### Step 6: Test Chat with Real AI

In the ARIA app:

1. Type a message: "Hello!"
2. You should see:
   - Message appears on right (blue)
   - ARIA responds on left (gray)
   - Shows source: "🟢 Local (llama2)" or "🟠 Cloud (gpt-3.5-turbo)"
   - Shows latency: "1234ms"

**If using local AI:**
- Messages take 2-5 seconds (Llama2 speed)
- Shows "🟢 Local (llama2)"
- No API costs

**If using cloud only:**
- Messages take 1-3 seconds (GPT-3.5-turbo speed)
- Shows "🟠 Cloud (gpt-3.5-turbo)"
- Requires OpenAI API key + costs money

## Configuration

### Using Cloud API

Edit `python-backend/.env`:

```
OPENAI_API_KEY=sk-your-key-from-openai
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-from-anthropic
```

Restart Python backend:
```bash
python app.py
```

### Switching AI Model

The default model is Llama2. To use a different model:

```bash
ollama pull mistral   # ~4GB
# or
ollama pull neural-chat  # ~4GB
```

Then set in Python backend .env or via settings panel (coming in Phase 2).

### Performance Tuning

**For fast local AI:**
- Use smaller model: `neural-chat` or `orca-mini` (~2GB, 1-2 sec/response)
- Use GPU: Install NVIDIA CUDA for 10x speedup

**For best quality:**
- Use cloud API: GPT-4 or Claude 3

## Troubleshooting

### "Python backend not responding"

Make sure Python backend is running:
```bash
# In python-backend terminal
python app.py
```

Check it's accessible:
```bash
curl http://localhost:8000/health
```

### "Tauri app won't start"

1. Check Rust is installed: `rustc --version`
2. Check Tauri CLI is installed: `npm ls @tauri-apps/cli`
3. Try rebuilding: `npm run tauri dev` again

### "Ollama models not loading"

1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Pull a model: `ollama pull llama2`
3. Restart Python backend

### "CORS errors"

The Tauri app communicates via IPC commands, not HTTP, so CORS shouldn't be an issue. If you see CORS errors:

1. Make sure Python backend is on localhost:8000
2. Check firewall isn't blocking local connections
3. Restart both Python backend and Tauri app

### "Chat is slow"

- **Local AI slow:** Your CPU/GPU is slower. Try smaller model.
- **Cloud API slow:** Internet latency or API overload. Check OpenAI status page.
- **Both slow:** Check `latency_ms` in chat messages to identify bottleneck.

## Project Structure

```
ARIA/
├── src/                      # React frontend (unchanged mostly)
│   ├── components/
│   │   ├── ChatInterface.tsx # Updated with AI source display
│   │   └── ...
│   ├── contexts/
│   │   └── AssistantContext.tsx # Updated for real AI
│   ├── hooks/
│   │   └── useChatStream.ts  # NEW: Streaming support
│   ├── utils/
│   │   └── tauriUtils.ts     # NEW: Tauri command wrappers
│   └── ...
├── src-tauri/                # NEW: Tauri Rust backend
│   ├── src/
│   │   ├── main.rs           # IPC command handlers
│   │   ├── ai.rs             # AI service coordination
│   │   ├── system.rs         # System control commands
│   │   └── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json       # Tauri app config
├── python-backend/           # NEW: Python AI server
│   ├── app.py                # FastAPI server
│   ├── ollama_service.py     # Ollama integration
│   ├── openai_service.py     # OpenAI/Anthropic integration
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Config template
│   └── README.md             # Backend documentation
├── package.json              # Updated with Tauri
└── vite.config.ts            # Vite config for dev server
```

## Development Workflow

### Hot Reload Development

When you modify React code:
```bash
npm run tauri dev
# App automatically reloads when you save files
```

When you modify Rust code:
```bash
# Need to rebuild - saves and run again
npm run tauri dev
```

### Building for Production

```bash
npm run tauri build
```

Creates platform-specific executable:
- **Windows:** `target/release/ARIA.exe` (~150MB)
- **macOS:** `target/release/ARIA.dmg`
- **Linux:** `target/release/ARIA`

## What's Working

✅ Chat with real AI (local Llama2 or cloud GPT-3.5)
✅ AI source indicator (shows if response is from local or cloud)
✅ Latency tracking (shows response time in milliseconds)
✅ Automatic fallback (switches to cloud if local model unavailable)
✅ Voice input/output (Web Speech API)
✅ Chat history persistence (localStorage)

## What's Coming Next (Phase 2+)

Phase 2 (System Control):
- File operations (read, write, delete)
- Process execution (launch apps, run scripts)
- System monitoring (real CPU/RAM/GPU data)
- Admin privilege handling

Phase 3 (Browser Automation):
- Browser tab control
- Web automation (click, type, navigate)
- Content extraction
- Multi-browser support

Phase 4 (Mobile Integration):
- iOS app (native Swift)
- Android app (native Kotlin)
- Cross-device sync
- File sharing between devices

## Key Files for Phase 1

**Frontend Changes:**
- `/src/components/ChatInterface.tsx` - AI source display
- `/src/contexts/AssistantContext.tsx` - Real AI integration
- `/src/utils/tauriUtils.ts` - Tauri command wrappers
- `/src/hooks/useChatStream.ts` - Streaming support

**Backend Services:**
- `/python-backend/app.py` - FastAPI main server
- `/python-backend/ollama_service.py` - Local model support
- `/python-backend/openai_service.py` - Cloud API support

**Tauri Integration:**
- `/src-tauri/src/main.rs` - Tauri app entry
- `/src-tauri/src/ai.rs` - AI coordination
- `/src-tauri/tauri.conf.json` - App configuration

## Next Steps

1. **Run the app:** Follow steps 1-6 above
2. **Test chat:** Send messages and verify AI responses
3. **Monitor logs:** Check console for any errors
4. **Adjust settings:** Try different models or APIs in `.env`
5. **Explore code:** See how Tauri IPC and Python services work
6. **Read Phase 2:** Check planning.md for system control features

## Support

For issues or questions:
1. Check Python backend logs for API errors
2. Check browser DevTools (F12) for frontend errors
3. Check Tauri logs for IPC issues
4. Read error messages in console - they're descriptive

## References

- **Tauri Docs:** https://tauri.app
- **Ollama Models:** https://ollama.ai/library
- **OpenAI API:** https://platform.openai.com/docs/api-reference
- **FastAPI:** https://fastapi.tiangolo.com
- **React:** https://react.dev

---

**Phase 1 Status:** ✅ Complete

You now have a working ARIA personal AI assistant with real intelligence!

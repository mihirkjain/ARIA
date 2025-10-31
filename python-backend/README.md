# ARIA Python Backend - AI Service

The Python backend provides the AI inference engine for ARIA, supporting both local models (via Ollama) and cloud APIs (OpenAI/Anthropic) with automatic fallback.

## Architecture

```
┌─────────────────────────────────────────┐
│   ARIA Desktop App (Tauri React)        │
│   - ChatInterface.tsx                   │
│   - tauriUtils.ts (invokeSendChat)      │
└──────────────┬──────────────────────────┘
               │ HTTP POST /api/chat
               ↓
┌─────────────────────────────────────────┐
│   Python FastAPI Backend (localhost:8000)│
│   - app.py (main server)                │
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         ↓           ↓
    ┌─────────┐  ┌──────────────┐
    │  Ollama │  │  Cloud APIs  │
    │ (Local) │  │ OpenAI/Claude│
    └─────────┘  └──────────────┘
```

## Setup

### 1. Install Dependencies

```bash
cd python-backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys (optional):

```bash
cp .env.example .env
```

Edit `.env`:

```
# Optional: For cloud API fallback
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Ollama local model server (if running locally)
OLLAMA_URL=http://localhost:11434
```

### 3. Install and Start Ollama (Optional)

For local AI model support, download and install Ollama:

**Download:** https://ollama.ai

**Start Ollama:**
```bash
ollama serve
```

**Pull a model:**
```bash
ollama pull llama2      # or: mistral, neural-chat, etc.
```

Available models: https://ollama.ai/library

### 4. Start Python Backend

```bash
python app.py
```

Server will be available at: `http://localhost:8000`

**Test the API:**
```bash
# Health check
curl http://localhost:8000/health

# Get AI status
curl http://localhost:8000/api/ai/status

# Send chat message
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "use_local": true, "fallback_to_cloud": true}'
```

## API Endpoints

### POST `/api/chat`

Send a message and get an AI response.

**Request:**
```json
{
  "message": "What is Python?",
  "use_local": true,
  "fallback_to_cloud": true
}
```

**Response:**
```json
{
  "response": "Python is a high-level programming language...",
  "source": "local",
  "model": "llama2",
  "latency_ms": 1234.5
}
```

### GET `/api/ai/status`

Check availability of AI services.

**Response:**
```json
{
  "ollama_running": true,
  "available_local_models": ["llama2", "mistral"],
  "cloud_api_available": true,
  "cloud_api_type": "openai"
}
```

### POST `/api/ai/config`

Configure AI preferences.

**Request:**
```json
{
  "local_model": "mistral",
  "cloud_api_type": "anthropic",
  "cloud_api_key": "sk-ant-...",
  "use_local_first": true
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Services

### OllamaService (`ollama_service.py`)

Manages local LLM inference via Ollama.

**Key Methods:**
- `check_ollama_running()` - Verify Ollama is accessible
- `get_available_models()` - List installed models
- `query_local_model(prompt)` - Get response from local model
- `set_active_model(model_name)` - Switch model
- `stream_response(prompt)` - Stream tokens in real-time

### OpenAIService (`openai_service.py`)

Handles cloud API fallback (OpenAI and Anthropic).

**Key Methods:**
- `is_cloud_api_configured()` - Check if API keys are set
- `query_cloud_api(prompt)` - Get response from cloud API
- `test_cloud_connection()` - Verify cloud API connectivity
- `set_api_key(key, api_type)` - Configure API

## Troubleshooting

### "Ollama is not running"

Make sure Ollama is installed and started:
```bash
ollama serve
```

Or download from https://ollama.ai

### "Connection refused: localhost:8000"

Make sure Python backend is running:
```bash
python app.py
```

Check that no other service is using port 8000.

### "API key not configured"

Set your API key in `.env` file or via POST `/api/ai/config` endpoint.

### Models not listed

Pull a model first:
```bash
ollama pull llama2
```

Then restart the backend.

## Local vs Cloud Decision

The backend uses this priority:

1. **Use Local First** (if configured):
   - Fast (no network latency)
   - Private (no data sent to cloud)
   - Free (no API costs)
   - Requires local GPU/CPU

2. **Fallback to Cloud** (if local fails or disabled):
   - Works on any computer
   - Better quality (larger models)
   - Costs money (per API call)
   - Requires internet

## Performance Tips

- **Local Model:** 2-5 seconds per response (depends on hardware)
- **Cloud Model:** 1-3 seconds per response (OpenAI GPT-3.5-turbo)

For best experience:
1. Use fast local model + cloud fallback
2. Or use cloud API directly (fastest, costs money)

## Architecture Notes

### Multi-Backend Support

The FastAPI backend is service-agnostic. You can add more backends:

- **Local:** Ollama, LM Studio, LocalAI
- **Cloud:** OpenAI, Anthropic, Cohere, Together AI

Just extend `OpenAIService` or create new service classes.

### Error Handling

- **Network errors:** Automatically fallback to cloud if configured
- **Invalid responses:** Return error to frontend
- **Rate limiting:** Implement in production

### Logging

All requests and responses are logged to console. Check logs for debugging.

## Next Steps

1. Run the Python backend: `python app.py`
2. Start Ollama (optional): `ollama serve`
3. Build and run the Tauri desktop app from ARIA root directory
4. Send chat messages from the UI

For more info, see the main ARIA README.md in the parent directory.

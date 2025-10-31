"""
ARIA Python Backend - FastAPI server for AI inference
Handles Ollama local models and cloud API fallback
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import logging
from typing import Optional

from ollama_service import OllamaService
from openai_service import OpenAIService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ARIA AI Service", version="0.1.0")

# Initialize services
ollama_service = OllamaService()
openai_service = OpenAIService()

class ChatRequest(BaseModel):
    message: str
    use_local: bool = True
    fallback_to_cloud: bool = True

class ChatResponse(BaseModel):
    response: str
    source: str  # "local" or "cloud"
    model: str
    latency_ms: float

class AIStatusResponse(BaseModel):
    ollama_running: bool
    available_local_models: list
    cloud_api_available: bool
    cloud_api_type: str
    error: Optional[str] = None

class AIConfigRequest(BaseModel):
    local_model: Optional[str] = None
    cloud_api_type: Optional[str] = None  # "openai" or "anthropic"
    cloud_api_key: Optional[str] = None
    use_local_first: bool = True

@app.on_event("startup")
async def startup_event():
    """Check AI services on startup"""
    logger.info("ARIA AI Service starting...")

    # Check Ollama
    ollama_status = await ollama_service.check_ollama_running()
    if ollama_status:
        models = await ollama_service.get_available_models()
        logger.info(f"Ollama is running with models: {models}")
    else:
        logger.warning("Ollama is not running - local AI will be unavailable")

    logger.info("ARIA AI Service ready")

@app.post("/api/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Send a chat message and get AI response

    Args:
        request: ChatRequest with message, use_local, fallback_to_cloud

    Returns:
        ChatResponse with response, source, model, latency
    """
    logger.info(f"Chat request: {request.message[:50]}... (use_local={request.use_local})")

    response_text = None
    source = None
    model = None
    latency = 0.0

    # Try local model first if requested
    if request.use_local:
        try:
            logger.info("Attempting local AI response...")
            response_text, model, latency = await ollama_service.query_local_model(request.message)
            source = "local"
            logger.info(f"Local response successful using {model}")
        except Exception as e:
            logger.warning(f"Local AI failed: {e}")
            if not request.fallback_to_cloud:
                raise HTTPException(status_code=503, detail=f"Local AI unavailable: {e}")
            # Continue to fallback

    # Fallback to cloud API if local failed or not requested
    if response_text is None:
        if request.fallback_to_cloud:
            try:
                logger.info("Attempting cloud API response...")
                response_text, model, latency = await openai_service.query_cloud_api(request.message)
                source = "cloud"
                logger.info(f"Cloud response successful using {model}")
            except Exception as e:
                logger.error(f"Cloud API failed: {e}")
                raise HTTPException(status_code=503, detail=f"Both AI services unavailable: {e}")
        else:
            raise HTTPException(status_code=503, detail="Local AI unavailable and cloud fallback disabled")

    return ChatResponse(
        response=response_text,
        source=source,
        model=model,
        latency_ms=latency
    )

@app.get("/api/ai/status")
async def get_ai_status() -> AIStatusResponse:
    """
    Get status of available AI services

    Returns:
        AIStatusResponse with availability of local and cloud AI
    """
    logger.info("Status check requested")

    ollama_running = await ollama_service.check_ollama_running()
    local_models = []

    if ollama_running:
        try:
            local_models = await ollama_service.get_available_models()
        except Exception as e:
            logger.warning(f"Failed to get Ollama models: {e}")

    cloud_available = await openai_service.is_cloud_api_configured()
    cloud_type = "openai"  # Default, could be "anthropic"

    return AIStatusResponse(
        ollama_running=ollama_running,
        available_local_models=local_models,
        cloud_api_available=cloud_available,
        cloud_api_type=cloud_type
    )

@app.post("/api/ai/config")
async def configure_ai(config: AIConfigRequest) -> dict:
    """
    Configure AI preferences and API keys

    Args:
        config: AIConfigRequest with model selections and API keys

    Returns:
        Success confirmation
    """
    logger.info(f"Configuration request: {config}")

    if config.local_model:
        try:
            await ollama_service.set_active_model(config.local_model)
            logger.info(f"Local model set to {config.local_model}")
        except Exception as e:
            logger.error(f"Failed to set local model: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to set model: {e}")

    if config.cloud_api_key:
        try:
            openai_service.set_api_key(config.cloud_api_key, config.cloud_api_type or "openai")
            logger.info(f"Cloud API configured for {config.cloud_api_type or 'openai'}")
        except Exception as e:
            logger.error(f"Failed to configure cloud API: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to configure cloud API: {e}")

    return {
        "success": True,
        "message": "Configuration updated"
    }

@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )

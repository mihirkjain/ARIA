"""
Ollama Service - Local LLM integration for ARIA
Handles communication with Ollama server running on localhost:11434
"""

import requests
import json
import logging
import time
from typing import Tuple, List

logger = logging.getLogger(__name__)

class OllamaService:
    """Service for interacting with Ollama local LLM"""

    def __init__(self):
        self.ollama_url = "http://localhost:11434"
        self.active_model = "llama2"  # Default model
        self.timeout = 30

    async def check_ollama_running(self) -> bool:
        """
        Check if Ollama service is running

        Returns:
            True if Ollama is accessible, False otherwise
        """
        try:
            response = requests.get(
                f"{self.ollama_url}/api/tags",
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return False

    async def get_available_models(self) -> List[str]:
        """
        Get list of available models from Ollama

        Returns:
            List of model names installed in Ollama
        """
        try:
            response = requests.get(
                f"{self.ollama_url}/api/tags",
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                if "models" in data:
                    models = [model["name"] for model in data["models"]]
                    logger.info(f"Available Ollama models: {models}")
                    return models
            return []
        except Exception as e:
            logger.error(f"Failed to get Ollama models: {e}")
            return []

    async def query_local_model(self, prompt: str) -> Tuple[str, str, float]:
        """
        Send prompt to local Ollama model and get response

        Args:
            prompt: User message/prompt

        Returns:
            Tuple of (response_text, model_name, latency_ms)
        """
        logger.info(f"Querying Ollama with model {self.active_model}")

        start_time = time.time()

        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.active_model,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.7,
                },
                timeout=self.timeout
            )

            if response.status_code == 200:
                data = response.json()
                response_text = data.get("response", "").strip()
                latency_ms = (time.time() - start_time) * 1000

                logger.info(f"Ollama response received in {latency_ms:.0f}ms")
                return response_text, self.active_model, latency_ms
            else:
                raise Exception(f"Ollama returned status {response.status_code}")

        except requests.exceptions.Timeout:
            raise Exception(f"Ollama request timed out after {self.timeout}s")
        except Exception as e:
            logger.error(f"Ollama query failed: {e}")
            raise

    async def set_active_model(self, model_name: str) -> bool:
        """
        Set the active model for queries

        Args:
            model_name: Name of model to use

        Returns:
            True if model was set successfully
        """
        # Check if model exists
        available = await self.get_available_models()

        if model_name in available:
            self.active_model = model_name
            logger.info(f"Active model changed to {model_name}")
            return True
        else:
            logger.error(f"Model {model_name} not found in available models: {available}")
            raise Exception(f"Model {model_name} not available")

    async def stream_response(self, prompt: str):
        """
        Stream response from Ollama (for real-time chat UX)

        Args:
            prompt: User message/prompt

        Yields:
            Response chunks as they arrive
        """
        logger.info(f"Streaming from Ollama with model {self.active_model}")

        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.active_model,
                    "prompt": prompt,
                    "stream": True,
                    "temperature": 0.7,
                },
                stream=True,
                timeout=self.timeout
            )

            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            chunk = data.get("response", "")
                            if chunk:
                                yield chunk
                        except json.JSONDecodeError:
                            continue
            else:
                raise Exception(f"Ollama returned status {response.status_code}")

        except Exception as e:
            logger.error(f"Ollama streaming failed: {e}")
            raise

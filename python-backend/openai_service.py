"""
Cloud API Service - OpenAI and Anthropic integration for ARIA
Handles fallback to cloud APIs when local model is unavailable
"""

import requests
import json
import logging
import time
from typing import Tuple
import os
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

class OpenAIService:
    """Service for cloud API fallback (OpenAI and Anthropic)"""

    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.active_api = "openai"  # Default API
        self.openai_model = "gpt-3.5-turbo"
        self.anthropic_model = "claude-3-haiku-20240307"

    async def is_cloud_api_configured(self) -> bool:
        """
        Check if any cloud API is configured

        Returns:
            True if OpenAI or Anthropic API key is set
        """
        has_openai = bool(self.openai_api_key)
        has_anthropic = bool(self.anthropic_api_key)
        logger.info(f"Cloud API status - OpenAI: {has_openai}, Anthropic: {has_anthropic}")
        return has_openai or has_anthropic

    async def query_cloud_api(self, prompt: str) -> Tuple[str, str, float]:
        """
        Send prompt to cloud API and get response

        Args:
            prompt: User message/prompt

        Returns:
            Tuple of (response_text, model_name, latency_ms)
        """
        start_time = time.time()

        if self.active_api == "openai":
            return await self._query_openai(prompt, start_time)
        elif self.active_api == "anthropic":
            return await self._query_anthropic(prompt, start_time)
        else:
            raise Exception(f"Unknown API type: {self.active_api}")

    async def _query_openai(self, prompt: str, start_time: float) -> Tuple[str, str, float]:
        """Query OpenAI API"""
        if not self.openai_api_key:
            raise Exception("OpenAI API key not configured")

        logger.info(f"Querying OpenAI with model {self.openai_model}")

        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.openai_model,
                    "messages": [
                        {"role": "system", "content": "You are ARIA, a helpful AI assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                },
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                response_text = data["choices"][0]["message"]["content"]
                latency_ms = (time.time() - start_time) * 1000

                logger.info(f"OpenAI response received in {latency_ms:.0f}ms")
                return response_text, self.openai_model, latency_ms
            else:
                error = response.json().get("error", {})
                raise Exception(f"OpenAI API error: {error.get('message', response.status_code)}")

        except Exception as e:
            logger.error(f"OpenAI query failed: {e}")
            raise

    async def _query_anthropic(self, prompt: str, start_time: float) -> Tuple[str, str, float]:
        """Query Anthropic API (Claude)"""
        if not self.anthropic_api_key:
            raise Exception("Anthropic API key not configured")

        logger.info(f"Querying Anthropic with model {self.anthropic_model}")

        try:
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.anthropic_model,
                    "max_tokens": 2000,
                    "system": "You are ARIA, a helpful AI assistant.",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                },
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                response_text = data["content"][0]["text"]
                latency_ms = (time.time() - start_time) * 1000

                logger.info(f"Anthropic response received in {latency_ms:.0f}ms")
                return response_text, self.anthropic_model, latency_ms
            else:
                error = response.json().get("error", {})
                raise Exception(f"Anthropic API error: {error.get('message', response.status_code)}")

        except Exception as e:
            logger.error(f"Anthropic query failed: {e}")
            raise

    async def test_cloud_connection(self) -> dict:
        """
        Test connection to cloud APIs

        Returns:
            Dict with status of each API
        """
        logger.info("Testing cloud API connections")

        results = {
            "openai_available": False,
            "anthropic_available": False,
        }

        # Test OpenAI
        if self.openai_api_key:
            try:
                response = requests.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {self.openai_api_key}"},
                    timeout=5
                )
                results["openai_available"] = response.status_code == 200
            except Exception as e:
                logger.warning(f"OpenAI connection test failed: {e}")

        # Test Anthropic
        if self.anthropic_api_key:
            try:
                response = requests.head(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": self.anthropic_api_key},
                    timeout=5
                )
                # Anthropic returns 401 for HEAD without proper payload, but connection is OK
                results["anthropic_available"] = response.status_code in [200, 401]
            except Exception as e:
                logger.warning(f"Anthropic connection test failed: {e}")

        return results

    def set_api_key(self, api_key: str, api_type: str = "openai") -> bool:
        """
        Set API key for cloud service

        Args:
            api_key: API key
            api_type: "openai" or "anthropic"

        Returns:
            True if key was set
        """
        if api_type == "openai":
            self.openai_api_key = api_key
            logger.info("OpenAI API key configured")
            self.active_api = "openai"
            return True
        elif api_type == "anthropic":
            self.anthropic_api_key = api_key
            logger.info("Anthropic API key configured")
            self.active_api = "anthropic"
            return True
        else:
            raise ValueError(f"Unknown API type: {api_type}")

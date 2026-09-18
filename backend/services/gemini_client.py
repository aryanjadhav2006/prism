import os
import json
import re
import asyncio
import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger("gemini_client")

class GeminiClient:
    """
    Ultra-Fast, High-Quota Google Gemini Client using gemini-3.1-flash-lite
    for instant multi-agent execution with zero quota stalls.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        # High quota, ultra-fast model priority
        self.models_to_try = [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-flash-latest"
        ]

    def _get_api_key(self, override_key: Optional[str] = None) -> str:
        return override_key or self.api_key or os.getenv("GEMINI_API_KEY", "")

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json"
        }

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        override_api_key: Optional[str] = None
    ) -> str:
        key = self._get_api_key(override_api_key)
        if not key:
            raise ValueError("Gemini API key is required. Please set GEMINI_API_KEY in .env.")

        last_error = None
        
        for model_name in self.models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
            
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"System Instructions:\n{system_instruction}\n\nTask:\n{prompt}" if system_instruction else prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens
                }
            }

            async with httpx.AsyncClient(timeout=20.0) as client:
                try:
                    response = await client.post(url, headers=self._get_headers(), json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts:
                                return parts[0].get("text", "")
                    
                    err_msg = f"HTTP {response.status_code}: {response.text}"
                    logger.warning(f"Model {model_name} failed: {err_msg}")
                    last_error = err_msg
                except Exception as e:
                    logger.error(f"Error calling Gemini model {model_name}: {e}")
                    last_error = str(e)

        raise RuntimeError(f"Failed to generate text from Gemini API. Details: {last_error}")

    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
        override_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        json_instruction = (system_instruction or "") + "\n\nCRITICAL: Respond STRICTLY with a valid JSON object. Do not include introductory text, conversational remarks, or Markdown code fences outside JSON."
        raw_text = await self.generate_text(
            prompt,
            system_instruction=json_instruction,
            temperature=temperature,
            max_tokens=max_tokens,
            override_api_key=override_api_key
        )
        return self._extract_json(raw_text)

    def _extract_json(self, raw_text: str) -> Dict[str, Any]:
        cleaned = raw_text.strip()
        if "```" in cleaned:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
            if match:
                cleaned = match.group(1).strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"(\{[\s\S]*\})", cleaned)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            logger.error(f"Failed to parse JSON from text: {raw_text[:200]}...")
            return {"error": "Failed to parse structured response", "raw_output": raw_text}

gemini_client = GeminiClient()

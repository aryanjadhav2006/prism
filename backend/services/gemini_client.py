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
    Unified LLM Client supporting both OpenRouter API (DeepSeek, Llama, Qwen, Gemini free tier)
    and Google Gemini direct API.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY", "")
        
        # Priority list for OpenRouter free models (Verified 200 OK)
        self.openrouter_models = [
            "deepseek/deepseek-v4-flash-0731:free",
            "nex-agi/nex-n2.5-pro:free",
            "inclusionai/ling-3.0-flash-vl:free",
            "nex-agi/nex-n2.5-mini:free"
        ]
        
        # Priority list for native Gemini models
        self.gemini_models = [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-flash-latest"
        ]

    def _get_api_key(self, override_key: Optional[str] = None) -> str:
        return override_key or self.api_key or os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY", "")

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
            raise ValueError("API key is required. Please set OPENROUTER_API_KEY or GEMINI_API_KEY in .env.")

        # Check if key is an OpenRouter key
        if key.startswith("sk-or-"):
            return await self._generate_openrouter(
                key=key,
                prompt=prompt,
                system_instruction=system_instruction,
                temperature=temperature,
                max_tokens=max_tokens
            )
        else:
            return await self._generate_gemini(
                key=key,
                prompt=prompt,
                system_instruction=system_instruction,
                temperature=temperature,
                max_tokens=max_tokens
            )

    async def _generate_openrouter(
        self,
        key: str,
        prompt: str,
        system_instruction: Optional[str],
        temperature: float,
        max_tokens: int
    ) -> str:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "PRISM Multi-Agent Framework"
        }

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        last_error = None
        for model in self.openrouter_models:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            # Swift 45s timeout for fast failover across free models
            async with httpx.AsyncClient(timeout=45.0) as client:
                try:
                    logger.info(f"Calling OpenRouter model: {model}")
                    response = await client.post(url, headers=headers, json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        choices = data.get("choices", [])
                        if choices and "message" in choices[0]:
                            msg = choices[0]["message"]
                            raw_val = msg.get("content") or msg.get("reasoning") or ""
                            content = re.sub(r"<think>[\s\S]*?</think>", "", str(raw_val)).strip()
                            if content:
                                return content
                    err_msg = f"HTTP {response.status_code}: {response.text}"
                    logger.warning(f"OpenRouter model {model} failed: {err_msg}")
                    last_error = err_msg
                except Exception as e:
                    logger.error(f"Error calling OpenRouter model {model}: {e}")
                    last_error = str(e)

        raise RuntimeError(f"Failed to generate text from OpenRouter API. Details: {last_error}")

    async def _generate_gemini(
        self,
        key: str,
        prompt: str,
        system_instruction: Optional[str],
        temperature: float,
        max_tokens: int
    ) -> str:
        headers = {"Content-Type": "application/json"}
        last_error = None

        for model_name in self.gemini_models:
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
                    response = await client.post(url, headers=headers, json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts:
                                return parts[0].get("text", "")
                    err_msg = f"HTTP {response.status_code}: {response.text}"
                    logger.warning(f"Gemini model {model_name} failed: {err_msg}")
                    last_error = err_msg
                except Exception as e:
                    logger.error(f"Error calling Gemini model {model_name}: {e}")
                    last_error = str(e)

        raise RuntimeError(f"Failed to generate text from Gemini API. Details: {last_error}")

    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 3500,
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
        m = re.search(r"```(?:json)?\s*([\s\S]*?)(?:```|$)", cleaned, re.IGNORECASE)
        if m:
            cleaned = m.group(1).strip()

        cleaned = re.sub(r",\s*([\]}])", r"\1", cleaned)

        try:
            return json.loads(cleaned)
        except Exception:
            # Fallback 1: Extract first balanced or bracketed JSON chunk
            bracket_match = re.search(r"(\{[\s\S]*\})", cleaned)
            if bracket_match:
                try:
                    return json.loads(re.sub(r",\s*([\]}])", r"\1", bracket_match.group(1)))
                except Exception:
                    pass

            # Fallback 2: Intelligent stack repair for truncated JSON
            stack = []
            in_string = False
            escape = False
            for char in cleaned:
                if escape:
                    escape = False
                    continue
                if char == "\\":
                    escape = True
                    continue
                if char == "\"":
                    in_string = not in_string
                    continue
                if not in_string:
                    if char in "{[":
                        stack.append("}" if char == "{" else "]")
                    elif char in "}]":
                        if stack and stack[-1] == char:
                            stack.pop()

            repaired = cleaned
            if in_string:
                repaired += "\""
            while stack:
                repaired += stack.pop()

            repaired = re.sub(r",\s*([\]}])", r"\1", repaired)
            try:
                return json.loads(repaired)
            except Exception as e:
                logger.error(f"Failed to parse JSON even after repair: {e}\nRaw sample: {raw_text[:200]}")
                return {"error": "Failed to parse structured response", "raw_output": raw_text}

gemini_client = GeminiClient()


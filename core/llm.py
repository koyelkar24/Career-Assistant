"""Single optional model-call boundary with retries and a small in-memory cache."""

from __future__ import annotations

import hashlib
import os
import time

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


_CACHE: dict[str, str] = {}


def is_configured() -> bool:
    return bool(os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY"))


def complete(prompt: str, *, model: str | None = None, retries: int = 2) -> str:
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    provider = "gemini" if gemini_key else "openai" if openai_key else ""
    if not provider:
        raise RuntimeError("Set GEMINI_API_KEY or OPENAI_API_KEY to enable AI features. Offline scoring and interview feedback still work.")

    if provider == "gemini":
        selected_model = model or os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    else:
        selected_model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    cache_key = hashlib.sha256((provider + "\0" + selected_model + "\0" + prompt).encode()).hexdigest()
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    if provider == "gemini":
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{selected_model}:generateContent"
        for attempt in range(retries + 1):
            try:
                response = requests.post(
                    endpoint,
                    headers={"x-goog-api-key": gemini_key},
                    json={"contents": [{"role": "user", "parts": [{"text": prompt}]}]},
                    timeout=60,
                )
                if not response.ok:
                    try:
                        detail = response.json().get("error", {}).get("message", "Request rejected")
                    except (ValueError, AttributeError):
                        detail = "Request rejected"
                    if response.status_code >= 500 and attempt < retries:
                        time.sleep(2 ** attempt)
                        continue
                    raise RuntimeError(f"Gemini API request failed ({response.status_code}): {detail}")
                payload = response.json()
                candidates = payload.get("candidates") or []
                parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
                result = "".join(part.get("text", "") for part in parts if isinstance(part, dict))
                if not result:
                    raise RuntimeError("Gemini returned no text. Please try again.")
                _CACHE[cache_key] = result
                return result
            except requests.RequestException:
                if attempt == retries:
                    raise
                time.sleep(2 ** attempt)

    try:
        from openai import OpenAI
        client = OpenAI()
        for attempt in range(retries + 1):
            try:
                response = client.responses.create(model=selected_model, input=prompt)
                result = response.output_text
                _CACHE[cache_key] = result
                return result
            except Exception:
                if attempt == retries:
                    raise
                time.sleep(2 ** attempt)
    except ImportError as exc:
        raise RuntimeError("Install openai to enable model calls.") from exc

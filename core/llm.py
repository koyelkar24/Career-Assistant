"""Single optional model-call boundary with retries and a small in-memory cache."""

from __future__ import annotations

import hashlib
import os
import time


_CACHE: dict[str, str] = {}


def complete(prompt: str, *, model: str | None = None, retries: int = 2) -> str:
    key = hashlib.sha256((model or "default" + prompt).encode()).hexdigest()
    if key in _CACHE:
        return _CACHE[key]
    if not os.getenv("OPENAI_API_KEY"):
        result = prompt.strip()
        _CACHE[key] = result
        return result
    try:
        from openai import OpenAI
        client = OpenAI()
        for attempt in range(retries + 1):
            try:
                response = client.responses.create(model=model or os.getenv("OPENAI_MODEL", "gpt-4o-mini"), input=prompt)
                result = response.output_text
                _CACHE[key] = result
                return result
            except Exception:
                if attempt == retries:
                    raise
                time.sleep(2 ** attempt)
    except ImportError as exc:
        raise RuntimeError("Install openai to enable model calls.") from exc

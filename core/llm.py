"""Single optional model-call boundary with retries and a small in-memory cache."""

from __future__ import annotations

import hashlib
import os
import time

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


_CACHE: dict[str, str] = {}


def is_configured() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def complete(prompt: str, *, model: str | None = None, retries: int = 2) -> str:
    selected_model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    key = hashlib.sha256((selected_model + "\0" + prompt).encode()).hexdigest()
    if key in _CACHE:
        return _CACHE[key]
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("Set OPENAI_API_KEY to enable AI features. Offline scoring and interview feedback still work.")
    try:
        from openai import OpenAI
        client = OpenAI()
        for attempt in range(retries + 1):
            try:
                response = client.responses.create(model=selected_model, input=prompt)
                result = response.output_text
                _CACHE[key] = result
                return result
            except Exception:
                if attempt == retries:
                    raise
                time.sleep(2 ** attempt)
    except ImportError as exc:
        raise RuntimeError("Install openai to enable model calls.") from exc

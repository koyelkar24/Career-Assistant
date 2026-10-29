"""Truth-preserving resume tailoring helpers."""

from __future__ import annotations

import re


def grounding_check(original: str, rewritten: str) -> dict[str, object]:
    original_numbers = set(re.findall(r"\b\d+(?:\.\d+)?%?\b", original))
    rewritten_numbers = set(re.findall(r"\b\d+(?:\.\d+)?%?\b", rewritten))
    unsupported_numbers = sorted(rewritten_numbers - original_numbers)
    return {"grounded": not unsupported_numbers, "unsupported_numbers": unsupported_numbers}


def tailor_summary(summary: str, job_description: str, max_words: int = 90) -> str:
    """Make a conservative keyword-aware summary without fabricating achievements."""
    terms = []
    for term in re.findall(r"[A-Za-z][A-Za-z0-9+#.-]{2,}", job_description):
        if term.lower() not in {x.lower() for x in terms}:
            terms.append(term)
    additions = [term for term in terms[:8] if term.lower() in summary.lower()]
    result = summary.strip()
    if additions and not any(term.lower() in result.lower() for term in additions):
        result += " | Relevant focus: " + ", ".join(additions)
    return " ".join(result.split()[:max_words])

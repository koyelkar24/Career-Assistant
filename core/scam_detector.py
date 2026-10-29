"""Heuristics for suspicious job postings; this is a warning system, not a verdict."""

from __future__ import annotations

import re


RED_FLAGS = {
    "upfront payment": re.compile(r"(pay|payment|fee|purchase).{0,35}(training|equipment|application|processing)", re.I | re.S),
    "guaranteed income": re.compile(r"guaranteed\s+(income|salary|job)", re.I),
    "crypto or gift cards": re.compile(r"(crypto|bitcoin|gift card|wire transfer)", re.I),
    "unusual contact": re.compile(r"(telegram|whatsapp only|personal gmail)", re.I),
}


def analyze_job(text: str) -> dict[str, object]:
    flags = [label for label, pattern in RED_FLAGS.items() if pattern.search(text)]
    score = min(100, len(flags) * 25)
    return {"risk_score": score, "risk_level": "high" if score >= 50 else "medium" if score else "low", "flags": flags, "recommendation": "Verify the employer independently and never pay to apply." if flags else "No obvious red flags found; still verify the employer and recruiter."}

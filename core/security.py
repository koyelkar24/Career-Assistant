"""Input hygiene for resumes, job descriptions, and model prompts."""

from __future__ import annotations

import re
from dataclasses import dataclass, field


PII_PATTERNS = {
    "email": re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"),
    "phone": re.compile(r"(?<!\w)(?:\+?\d[\d ()-]{7,}\d)(?!\w)"),
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "url": re.compile(r"https?://[^\s]+", re.I),
}
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(?:all\s+)?previous instructions", re.I),
    re.compile(r"system\s+message\s*[:=]", re.I),
    re.compile(r"(reveal|print|show)\s+(?:the\s+)?(?:prompt|system instructions)", re.I),
    re.compile(r"<\s*(?:script|iframe)\b", re.I),
]


@dataclass
class SecurityReport:
    redacted_text: str
    findings: list[str] = field(default_factory=list)
    injection_detected: bool = False
    hidden_text_detected: bool = False


def redact_pii(text: str, replacement: str = "[REDACTED]") -> tuple[str, list[str]]:
    findings: list[str] = []
    output = text
    for label, pattern in PII_PATTERNS.items():
        output, count = pattern.subn(replacement, output)
        if count:
            findings.append(f"{label}:{count}")
    return output, findings


def scan_prompt_injection(text: str) -> list[str]:
    return [pattern.pattern for pattern in INJECTION_PATTERNS if pattern.search(text)]


def detect_hidden_text(text: str) -> bool:
    """Detect common zero-width/control characters used to hide instructions."""
    return bool(re.search(r"[\u200b-\u200f\u202a-\u202e\u2060\ufeff]|[\x00-\x08\x0b\x0c\x0e-\x1f]", text))


def inspect_text(text: str, redact: bool = True) -> SecurityReport:
    injections = scan_prompt_injection(text)
    hidden = detect_hidden_text(text)
    cleaned, pii = redact_pii(text) if redact else (text, [])
    findings = pii + (["prompt_injection"] if injections else []) + (["hidden_text"] if hidden else [])
    return SecurityReport(cleaned, findings, bool(injections), hidden)

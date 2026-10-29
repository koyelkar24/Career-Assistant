"""Resume loading and lightweight structure extraction."""

from __future__ import annotations

import io
import re
from pathlib import Path
from typing import Any


SECTION_ALIASES = {
    "summary": {"summary", "profile", "objective", "about"},
    "experience": {"experience", "work experience", "employment", "professional experience"},
    "education": {"education", "academic background"},
    "skills": {"skills", "technical skills", "core competencies", "technologies"},
    "projects": {"projects", "selected projects"},
    "certifications": {"certifications", "licenses"},
}


def load_text(source: str | Path | bytes, filename: str | None = None) -> str:
    """Extract text from plain text, PDF, or DOCX input."""
    name = (filename or str(source if not isinstance(source, (bytes, bytearray)) else "resume.txt")).lower()
    if isinstance(source, (bytes, bytearray)):
        raw = bytes(source)
    else:
        raw = Path(source).read_bytes()
    if name.endswith(".pdf"):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(raw)) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages).strip()
        except ImportError as exc:
            raise RuntimeError("PDF parsing requires pdfplumber.") from exc
    if name.endswith(".docx"):
        try:
            from docx import Document
            return "\n".join(p.text for p in Document(io.BytesIO(raw)).paragraphs).strip()
        except ImportError as exc:
            raise RuntimeError("DOCX parsing requires python-docx.") from exc
    return raw.decode("utf-8", errors="replace").strip()


def _section_name(line: str) -> str | None:
    normalized = re.sub(r"[^a-z ]", "", line.lower()).strip()
    for name, aliases in SECTION_ALIASES.items():
        if normalized in aliases:
            return name
    return None


def structure_resume(text: str) -> dict[str, Any]:
    """Return a predictable resume structure without inventing content."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    sections: dict[str, list[str]] = {key: [] for key in SECTION_ALIASES}
    current = "summary"
    header: list[str] = []
    for line in lines:
        section = _section_name(line)
        if section:
            current = section
            continue
        if current == "summary" and len(header) < 3:
            header.append(line)
        sections[current].append(line)
    email = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    phone = re.search(r"(?:\+?\d[\d ()-]{7,}\d)", text)
    return {"name": header[0] if header else "", "contact": {"email": email.group(0) if email else "", "phone": phone.group(0) if phone else ""}, "sections": sections, "raw_text": text}


def parse_resume(source: str | Path | bytes, filename: str | None = None) -> dict[str, Any]:
    return structure_resume(load_text(source, filename))

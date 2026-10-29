"""Deterministic hybrid-style ATS scoring."""

from __future__ import annotations

import re
from collections import Counter
from typing import Any

from schemas.models import ATSScore


STOPWORDS = {"and", "the", "with", "for", "from", "that", "this", "you", "your", "are", "our", "will", "have", "has", "into", "years", "job", "role"}


def _keywords(text: str) -> list[str]:
    words = re.findall(r"[a-z][a-z0-9+#.-]{2,}", text.lower())
    return [word for word, count in Counter(words).most_common() if word not in STOPWORDS and count >= 1]


def score_resume(resume: str | dict[str, Any], job_description: str) -> ATSScore:
    resume_text = resume if isinstance(resume, str) else resume.get("raw_text", "")
    resume_words = set(_keywords(resume_text))
    job_words = _keywords(job_description)
    unique_job = list(dict.fromkeys(job_words))
    matched = [word for word in unique_job if word in resume_words]
    missing = [word for word in unique_job if word not in resume_words][:20]
    keyword_match = round(100 * len(matched) / max(1, len(unique_job)), 1)
    section_data = resume.get("sections", {}) if isinstance(resume, dict) else {}
    expected = ("summary", "experience", "education", "skills")
    present = sum(bool(section_data.get(key)) for key in expected)
    section_score = present / len(expected) * 100 if section_data else min(100, len(resume_text.split()) / 5)
    sentences = re.split(r"[.!?]+", resume_text)
    avg_sentence = len(resume_text.split()) / max(1, len([s for s in sentences if s.strip()]))
    readability = 90 if 8 <= avg_sentence <= 24 else max(45, 90 - abs(avg_sentence - 16) * 2)
    overall = round(keyword_match * 0.6 + section_score * 0.25 + readability * 0.15, 1)
    suggestions = []
    if missing:
        suggestions.append("Add relevant missing keywords only where they truthfully describe your experience.")
    if section_score < 100:
        suggestions.append("Add clear Summary, Experience, Education, and Skills headings.")
    if readability < 70:
        suggestions.append("Shorten dense sentences and use concise bullet points.")
    return ATSScore(overall=overall, keyword_match=keyword_match, section_completeness=round(section_score, 1), readability=round(readability, 1), matched_keywords=matched, missing_keywords=missing, suggestions=suggestions)

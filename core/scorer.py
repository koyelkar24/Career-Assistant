"""Deterministic hybrid-style ATS scoring."""

from __future__ import annotations

import re
from collections import Counter
from typing import Any

from schemas.models import ATSScore


STOPWORDS = {"and", "the", "with", "for", "from", "that", "this", "you", "your", "are", "our", "will", "have", "has", "into", "years", "job", "role"}

# Common job-posting typos should not become artificial ATS gaps. Keep the
# original spelling available so the UI can point out and correct the source.
COMMON_TYPO_CORRECTIONS = {
    "devolopment": "development",
    "developement": "development",
    "managment": "management",
    "enginering": "engineering",
    "engineerning": "engineering",
    "javascipt": "javascript",
    "kubernets": "kubernetes",
    "analtyics": "analytics",
    "communicaton": "communication",
}


def _keywords(text: str) -> list[str]:
    words = re.findall(r"[a-z][a-z0-9+#.-]{2,}", text.lower())
    return [word for word, count in Counter(words).most_common() if word not in STOPWORDS and count >= 1]


def _canonical_keyword(word: str) -> str:
    return COMMON_TYPO_CORRECTIONS.get(word, word)


def score_resume(resume: str | dict[str, Any], job_description: str) -> ATSScore:
    resume_text = resume if isinstance(resume, str) else resume.get("raw_text", "")
    resume_words = {_canonical_keyword(word) for word in _keywords(resume_text)}
    job_words = _keywords(job_description)
    unique_job = list(dict.fromkeys(_canonical_keyword(word) for word in job_words))
    matched = [word for word in unique_job if word in resume_words]
    missing = [word for word in unique_job if word not in resume_words][:20]
    keyword_match = round(100 * len(matched) / max(1, len(unique_job)), 1)
    section_data = resume.get("sections", {}) if isinstance(resume, dict) else {}
    expected = ("summary", "experience", "education", "skills")
    # Count headings the parser actually found. Header/contact lines must not
    # accidentally count as a Summary section.
    detected_sections = resume.get("sections_detected") if isinstance(resume, dict) else None
    present = sum(key in detected_sections for key in expected) if detected_sections is not None else sum(bool(section_data.get(key)) for key in expected)
    section_score = present / len(expected) * 100 if section_data else min(100, len(resume_text.split()) / 5)
    sentences = re.split(r"[.!?]+", resume_text)
    avg_sentence = len(resume_text.split()) / max(1, len([s for s in sentences if s.strip()]))
    readability = 90 if 8 <= avg_sentence <= 24 else max(45, 90 - abs(avg_sentence - 16) * 2)
    overall = round(keyword_match * 0.6 + section_score * 0.25 + readability * 0.15, 1)
    suggestions = []
    typo_notes = [f"{original} → {corrected}" for original, corrected in COMMON_TYPO_CORRECTIONS.items() if original in job_words]
    if typo_notes:
        suggestions.append("Possible spelling issue in job description: " + ", ".join(typo_notes) + ". We normalized these for keyword matching.")
    if missing:
        suggestions.append("Add relevant missing keywords only where they truthfully describe your experience.")
    if section_score < 100:
        suggestions.append("Add clear Summary, Experience, Education, and Skills headings.")
    if readability < 70:
        suggestions.append("Shorten dense sentences and use concise bullet points.")
    return ATSScore(overall=overall, keyword_match=keyword_match, section_completeness=round(section_score, 1), readability=round(readability, 1), matched_keywords=matched, missing_keywords=missing, suggestions=suggestions)

"""Skill-gap roadmap generation."""

from __future__ import annotations


def build_roadmap(missing_keywords: list[str], limit: int = 8) -> list[dict[str, object]]:
    return [{"skill": skill, "priority": "high" if index < 3 else "medium", "action": f"Review one practical {skill} example and add evidence to a project or portfolio.", "resources": []} for index, skill in enumerate(dict.fromkeys(missing_keywords)[:limit])]

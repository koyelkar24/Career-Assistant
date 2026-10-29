"""Grounded cover-letter generation."""

from __future__ import annotations


def generate_cover_letter(name: str, company: str, role: str, resume_summary: str, job_description: str = "") -> str:
    return f"""Dear Hiring Manager,\n\nI am excited to apply for the {role} position at {company}. {resume_summary.strip()}\n\nThe role's focus on the needs described in the job posting aligns with my background and the way I approach practical, measurable work. I would welcome the opportunity to discuss how I can contribute to {company}.\n\nThank you for your consideration.\n\nSincerely,\n{name or 'Candidate'}"""

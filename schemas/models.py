"""Pydantic models shared by UI, services, and tests."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class Resume(BaseModel):
    name: str = ""
    contact: dict[str, str] = Field(default_factory=dict)
    sections: dict[str, list[str]] = Field(default_factory=dict)
    raw_text: str = ""


class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str = ""
    url: str = ""
    description: str = ""
    source: str = "csv"
    posted_date: date | None = None


class ATSScore(BaseModel):
    overall: float = Field(ge=0, le=100)
    keyword_match: float = Field(ge=0, le=100)
    section_completeness: float = Field(ge=0, le=100)
    readability: float = Field(ge=0, le=100)
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class Application(BaseModel):
    id: int | None = None
    job_id: str = ""
    title: str
    company: str
    status: str = "Saved"
    applied_on: date | None = None
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterviewQuestion(BaseModel):
    question: str
    category: str = "behavioral"
    answer: str = ""


class RoadmapItem(BaseModel):
    skill: str
    priority: str = "medium"
    action: str
    resources: list[str] = Field(default_factory=list)

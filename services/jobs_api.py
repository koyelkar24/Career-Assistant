"""Job search service with JSearch support and CSV fallback."""

from __future__ import annotations

import csv
import os
from pathlib import Path

from schemas.models import Job


def search_csv(query: str = "", path: str | Path = "data/jobs.csv") -> list[Job]:
    query = query.lower().strip()
    with Path(path).open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    return [Job(id=str(row.get("id", index)), title=row.get("title", ""), company=row.get("company", ""), location=row.get("location", ""), url=row.get("url", ""), description=row.get("description", ""), source="csv") for index, row in enumerate(rows) if not query or query in " ".join(row.values()).lower()]


def search_jobs(query: str, location: str = "", limit: int = 10) -> list[Job]:
    api_key = os.getenv("RAPIDAPI_KEY")
    if api_key:
        try:
            import requests
            response = requests.get("https://jsearch.p.rapidapi.com/search", params={"query": f"{query} in {location}".strip(), "page": "1", "num_pages": "1"}, headers={"X-RapidAPI-Key": api_key, "X-RapidAPI-Host": "jsearch.p.rapidapi.com"}, timeout=15)
            response.raise_for_status()
            data = response.json().get("data", [])
            return [Job(id=item.get("job_id", str(index)), title=item.get("job_title", ""), company=item.get("employer_name", ""), location=item.get("job_city", ""), url=item.get("job_apply_link", ""), description=item.get("job_description", ""), source="jsearch") for index, item in enumerate(data[:limit])]
        except Exception:
            pass
    return search_csv(query, limit and "data/jobs.csv")[:limit]

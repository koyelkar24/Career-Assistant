"""Tests for the offline job-search fallback."""

from pathlib import Path

from services.jobs_api import search_csv

DATA = Path(__file__).resolve().parent.parent / "data" / "jobs.csv"


def test_multi_word_query_matches_every_term():
    jobs = search_csv("Product Designer", path=DATA)
    assert jobs
    for job in jobs:
        searchable = f"{job.title} {job.description}".lower()
        assert "product" in searchable
        assert "designer" in searchable


def test_location_filter_limits_results():
    jobs = search_csv("designer", "remote", path=DATA)
    assert jobs
    assert all("remote" in job.location.lower() for job in jobs)


def test_unknown_query_returns_no_jobs():
    assert search_csv("astronaut", path=DATA) == []

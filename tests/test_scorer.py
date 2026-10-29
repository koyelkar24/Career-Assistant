from core.scorer import score_resume


def test_score_favors_matching_keywords():
    result = score_resume({"raw_text": "Python SQL Git", "sections": {"summary": ["x"], "experience": ["x"], "education": ["x"], "skills": ["x"]}}, "Python developer with SQL and Git")
    assert result.overall >= 50
    assert "python" in result.matched_keywords


def test_empty_resume_is_safe():
    assert score_resume("", "Python developer").overall >= 0

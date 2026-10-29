"""Mock interview question generation and answer feedback."""

from __future__ import annotations


def generate_questions(role: str, count: int = 5) -> list[dict[str, str]]:
    questions = [
        ("Tell me about yourself and why this role interests you.", "opening"),
        (f"Describe a project that shows you can succeed as a {role}.", "technical"),
        ("Tell me about a difficult problem you solved. What was the result?", "behavioral"),
        ("How do you prioritize when requirements or deadlines change?", "behavioral"),
        ("What would you like to learn in your first 90 days?", "closing"),
    ]
    return [{"question": question, "category": category} for question, category in questions[:max(1, count)]]


def evaluate_answer(answer: str) -> dict[str, object]:
    words = answer.split()
    signals = {"situation": any(x in answer.lower() for x in ("when", "situation", "context")), "action": any(x in answer.lower() for x in ("I", "led", "built", "created", "decided")), "result": any(x in answer.lower() for x in ("result", "improved", "%", "reduced", "increased"))}
    score = round(sum(signals.values()) / 3 * 100)
    return {"score": score, "word_count": len(words), "signals": signals, "feedback": "Use a concise Situation–Action–Result structure and include a measurable outcome." if score < 100 else "Strong STAR structure; keep the answer concise and specific."}

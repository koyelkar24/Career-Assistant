"""Small orchestration flow with an optional LangGraph adapter."""

from __future__ import annotations

from .scorer import score_resume


def analyze_resume_for_job(resume: str | dict, job_description: str) -> dict:
    result = {"resume": resume, "job_description": job_description}
    result["score"] = score_resume(resume, job_description).model_dump()
    return result


def build_graph():
    try:
        from langgraph.graph import END, START, StateGraph
    except ImportError:
        return None
    graph = StateGraph(dict)
    graph.add_node("score", lambda state: analyze_resume_for_job(state["resume"], state["job_description"]))
    graph.add_edge(START, "score")
    graph.add_edge("score", END)
    return graph.compile()

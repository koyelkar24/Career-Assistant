"""Landing page and shared session setup for the Career Assistant."""

from __future__ import annotations


def initialize_session(session_state) -> None:
    """Create shared values once, keeping user data available across pages."""
    defaults = {
        "resume": None,
        "resume_text": "",
        "jobs": [],
        "selected_job": None,
        "interview_history": [],
    }
    for key, value in defaults.items():
        if key not in session_state:
            # Lists and dictionaries must be fresh for each Streamlit session.
            session_state[key] = value.copy() if isinstance(value, (list, dict)) else value


def main() -> None:
    try:
        import streamlit as st
    except ImportError as exc:
        raise RuntimeError(
            "Streamlit is required to run this app. Install dependencies with "
            "`pip install -r requirements.txt`."
        ) from exc

    st.set_page_config(
        page_title="Career Assistant",
        page_icon="🎯",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    initialize_session(st.session_state)

    st.title("Career Assistant")
    st.write(
        "One workspace to improve your resume, discover opportunities, organize "
        "applications, and practice interviews."
    )

    st.subheader("Get started")
    st.write("Choose a tool to continue:")

    resume_col, jobs_col = st.columns(2)
    with resume_col:
        st.markdown("### Resume & ATS")
        st.write("Upload a resume, review its structure, and compare it with a job description.")
        st.page_link("pages/1_Resume_and_ATS.py", label="Analyze a resume", icon="📄")

    with jobs_col:
        st.markdown("### Job Search")
        st.write("Search available roles and review job posting details.")
        st.page_link("pages/2_Job_Search.py", label="Search jobs", icon="🔎")

    tracker_col, interview_col = st.columns(2)
    with tracker_col:
        st.markdown("### Application Tracker")
        st.write("Keep application statuses and notes together as you apply.")
        st.page_link("pages/3_Tracker.py", label="Open tracker", icon="📋")

    with interview_col:
        st.markdown("### Mock Interview")
        st.write("Practice common questions for your target role and get answer feedback.")
        st.page_link("pages/4_Mock_Interview.py", label="Practice interview", icon="🎤")

    st.divider()
    st.caption(
        "Your resume and job search results stay in this browser session. "
        "Application records are stored locally in SQLite."
    )


if __name__ == "__main__":
    main()

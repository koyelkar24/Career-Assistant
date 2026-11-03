"""Landing page and shared session setup for the Career Assistant."""

from __future__ import annotations

from core.ui import render_site_navigation


def initialize_session(session_state) -> None:
    """Create shared values once, keeping user data available across pages."""
    defaults = {
        "resume": None,
        "resume_text": "",
        "jobs": [],
        "job_search_performed": False,
        "selected_job": None,
        "interview_history": [],
    }
    for key, value in defaults.items():
        if key not in session_state:
            # Lists and dictionaries must be fresh for each Streamlit session.
            session_state[key] = value.copy() if isinstance(value, (list, dict)) else value


def _add_styles(st) -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

        :root {
          --ink: #17243b;
          --muted: #69758c;
          --green: #355fe8;
          --green-dark: #294fc9;
          --line: #e4e9f2;
          --paper: #f5f7fb;
        }
        .stApp { background: var(--paper); color: var(--ink); }
        .stApp, .stApp p, .stApp label { font-family: 'DM Sans', sans-serif; }
        [data-testid="stHeader"] { background: transparent; }
        [data-testid="stMainBlockContainer"] { max-width: 1190px; padding-top: 2.2rem; padding-bottom: 3rem; }
        h1, h2, h3 { font-family: 'Manrope', sans-serif !important; color: var(--ink); letter-spacing: -0.035em; }
        [data-testid="stSidebar"] { background: #f0f3f9; border-right: 1px solid var(--line); }
        [data-testid="stSidebarNav"] { padding-top: .8rem; }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px; padding: 7px 11px;
          border: 1px solid #dce4ff; border-radius: 999px; background: #eef2ff;
          color: var(--green-dark); font-size: 12px; font-weight: 700; letter-spacing: .055em;
          text-transform: uppercase;
        }
        .eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #5577f2; }
        .hero {
          position: relative; overflow: hidden; min-height: 300px; padding: 42px 44px;
          border-radius: 26px; color: white;
          background: radial-gradient(ellipse at 82% 8%, rgba(128,157,255,.35), transparent 34%),
                      linear-gradient(118deg, #17294b 0%, #203d83 60%, #315bc4 100%);
          box-shadow: 0 18px 45px rgba(38, 60, 119, .16);
        }
        .hero::after {
          content: ''; position: absolute; width: 340px; height: 340px; right: -80px; bottom: -210px;
          border: 1px solid rgba(255,255,255,.18); border-radius: 50%;
          box-shadow: 0 0 0 32px rgba(255,255,255,.035), 0 0 0 66px rgba(255,255,255,.025);
        }
        .hero-copy { position: relative; z-index: 1; max-width: 650px; }
        .hero-layout { display: flex; align-items: center; justify-content: space-between; gap: 36px; }
        .hero-side-note { position: relative; z-index: 1; flex: 0 0 210px; padding: 18px; border: 1px solid rgba(255,255,255,.19); border-radius: 16px; background: rgba(255,255,255,.09); backdrop-filter: blur(8px); }
        .hero-side-label { color: #c4d1ff; font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
        .hero-side-number { margin: 12px 0 4px; color: #fff; font: 800 31px 'Manrope',sans-serif; letter-spacing: -.05em; }
        .hero-side-caption { color: #dce4ff; font-size: 12px; line-height: 1.5; }
        .hero-kicker { color: #c4d1ff; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        .hero-title { margin: 18px 0 12px; color: white; font: 800 clamp(35px, 5vw, 53px)/1.08 'Manrope', sans-serif; letter-spacing: -.055em; }
        .hero-description { max-width: 560px; margin: 0; color: #dce4ff; font-size: 15px; line-height: 1.7; }
        .hero-pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 26px; }
        .hero-pill { padding: 8px 12px; border: 1px solid rgba(255,255,255,.2); border-radius: 999px; color: #f4f6ff; background: rgba(255,255,255,.09); font-size: 12px; }
        .section-heading { margin: 38px 0 5px; font: 750 24px 'Manrope', sans-serif; letter-spacing: -.04em; color: var(--ink); }
        .section-subtitle { margin: 0 0 18px; color: var(--muted); font-size: 14px; }
        .st-key-resume_card, .st-key-jobs_card, .st-key-tracker_card, .st-key-interview_card {
          min-height: 194px; padding: 20px 22px 15px !important; border: 1px solid var(--line);
          border-radius: 15px; background: #fff; box-shadow: 0 3px 13px rgba(29, 43, 74, .035);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .st-key-resume_card:hover, .st-key-jobs_card:hover, .st-key-tracker_card:hover, .st-key-interview_card:hover {
          transform: translateY(-3px); border-color: #c8d3fb; box-shadow: 0 12px 28px rgba(45, 72, 151, .09);
        }
        .tool-icon { display: flex; width: 42px; height: 42px; align-items: center; justify-content: center; margin-bottom: 15px; border-radius: 12px; color: #355fe8; background: #eef2ff; font: 800 11px 'Manrope',sans-serif; letter-spacing: .02em; }
        .tool-title { margin: 0 0 6px; color: var(--ink); font: 750 17px 'Manrope', sans-serif; letter-spacing: -.025em; }
        .tool-description { min-height: 42px; margin: 0; color: var(--muted); font-size: 13px; line-height: 1.55; }
        .tool-card-action { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid #edf0f6; color: var(--green); font-size: 13px; font-weight: 700; text-decoration: none; }
        .tool-card-action:hover { color: var(--green-dark); }
        .tool-card-action span { font-size: 17px; transition: transform .15s ease; }
        .tool-card-action:hover span { transform: translateX(3px); }
        .st-key-resume_card [data-testid="stPageLink"] a,
        .st-key-jobs_card [data-testid="stPageLink"] a,
        .st-key-tracker_card [data-testid="stPageLink"] a,
        .st-key-interview_card [data-testid="stPageLink"] a {
          margin-top: 13px; padding: 0; border: 0; color: var(--green); font-size: 13px; font-weight: 700;
          background: transparent; box-shadow: none;
        }
        .st-key-resume_card [data-testid="stPageLink"] a:hover,
        .st-key-jobs_card [data-testid="stPageLink"] a:hover,
        .st-key-tracker_card [data-testid="stPageLink"] a:hover,
        .st-key-interview_card [data-testid="stPageLink"] a:hover { color: var(--green-dark); background: transparent; }
        .snapshot {
          display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 28px;
          padding: 19px 22px; border: 1px solid var(--line); border-radius: 14px; background: #fff;
        }
        .snapshot-label { color: var(--muted); font-size: 12px; font-weight: 600; }
        .snapshot-value { margin-top: 4px; color: var(--ink); font: 750 20px 'Manrope', sans-serif; letter-spacing: -.04em; }
        .snapshot-note { color: var(--muted); font-size: 12px; }
        .snapshot-divider { width: 1px; height: 38px; background: var(--line); }
        .privacy-note { margin-top: 20px; color: #7b8496; font-size: 12px; text-align: center; }
        @media (max-width: 700px) {
          [data-testid="stMainBlockContainer"] { padding: 1rem 1rem 2rem; }
          .hero { min-height: 0; padding: 30px 25px; border-radius: 20px; }
          .hero-title { font-size: 36px; }
          .hero-layout { display: block; }
          .hero-side-note { display: none; }
          .st-key-resume_card, .st-key-jobs_card, .st-key-tracker_card, .st-key-interview_card { min-height: 0; }
          .snapshot { flex-wrap: wrap; }
          .snapshot-divider { display: none; }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _tool_card(st, key: str, icon: str, title: str, description: str, page: str, action: str) -> None:
    with st.container(key=key):
        routes = {
            "pages/1_Resume_and_ATS.py": "/Resume_and_ATS",
            "pages/2_Job_Search.py": "/Job_Search",
            "pages/3_Tracker.py": "/Tracker",
            "pages/4_Mock_Interview.py": "/Mock_Interview",
        }
        route = routes[page]
        st.html(
            f'<div class="tool-icon">{icon}</div><div class="tool-title">{title}</div>'
            f'<p class="tool-description">{description}</p>'
            f'<a class="tool-card-action" href="{route}">{action}<span aria-hidden="true">&rarr;</span></a>'
        )


def main() -> None:
    try:
        import streamlit as st
    except ImportError as exc:
        raise RuntimeError(
            "Streamlit is required to run this app. Install dependencies with "
            "`pip install -r requirements.txt`."
        ) from exc

    st.set_page_config(
        page_title="Career Assistant | Your next move, made clearer",
        page_icon="🎯",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    initialize_session(st.session_state)
    _add_styles(st)
    render_site_navigation(st)

    st.markdown(
        """
        <div class="hero">
          <div class="hero-layout">
          <div class="hero-copy">
            <div class="hero-kicker">A clearer path to your next role</div>
            <h1 class="hero-title">Move your career<br>forward with intent.</h1>
            <p class="hero-description">Make a stronger first impression, find roles that fit, and keep each application moving from one calm workspace.</p>
            <div class="hero-pills"><span class="hero-pill">Resume review</span><span class="hero-pill">Role discovery</span><span class="hero-pill">Interview practice</span></div>
          </div>
          <div class="hero-side-note"><div class="hero-side-label">Your next step</div><div class="hero-side-number">01</div><div class="hero-side-caption">Start with a resume review, then tailor it to a role you want.</div></div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown('<div class="section-heading">Your career toolkit</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-subtitle">Four practical tools to help you prepare, search, and follow through.</div>', unsafe_allow_html=True)

    col1, col2 = st.columns(2, gap="medium")
    with col1:
        _tool_card(st, "resume_card", "01", "Resume & ATS review", "See how your resume reads to applicant tracking systems, then sharpen it for the role.", "pages/1_Resume_and_ATS.py", "Review my resume")
    with col2:
        _tool_card(st, "jobs_card", "02", "Find your next role", "Search relevant openings and get a quick read on the quality of each posting.", "pages/2_Job_Search.py", "Explore opportunities")

    col3, col4 = st.columns(2, gap="medium")
    with col3:
        _tool_card(st, "tracker_card", "03", "Application tracker", "Keep roles, follow-ups, and application notes together in one simple view.", "pages/3_Tracker.py", "View my applications")
    with col4:
        _tool_card(st, "interview_card", "04", "Mock interview", "Build confidence with role-based practice questions and useful answer feedback.", "pages/4_Mock_Interview.py", "Start practicing")

    resume_ready = bool(st.session_state.get("resume"))
    jobs_count = len(st.session_state.get("jobs", []))
    st.markdown(
        f"""
        <div class="snapshot">
          <div><div class="snapshot-label">Resume workspace</div><div class="snapshot-value">{'Ready to review' if resume_ready else 'Not started yet'}</div></div>
          <div class="snapshot-divider"></div>
          <div><div class="snapshot-label">Roles in your search</div><div class="snapshot-value">{jobs_count} <span class="snapshot-note">saved this session</span></div></div>
          <div class="snapshot-divider"></div>
          <div><div class="snapshot-label">A good first step</div><div class="snapshot-value">Start with your resume <span class="snapshot-note">→</span></div></div>
        </div>
        <div class="privacy-note">Your resume and search results stay in this browser session. Application records are stored locally.</div>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()

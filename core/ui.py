"""Shared visual styling and page header for the Streamlit workspace."""

from __future__ import annotations


def apply_workspace_styles(st) -> None:
    """Give every multipage screen the same calm, readable visual baseline."""
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        :root {
          --workspace-ink: #172b2a;
          --workspace-muted: #687b77;
          --workspace-green: #147d68;
          --workspace-line: #e5ece7;
          --workspace-paper: #f7f9f6;
        }
        .stApp { background: var(--workspace-paper); color: var(--workspace-ink); }
        .stApp, .stApp p, .stApp label { font-family: 'DM Sans', sans-serif; }
        [data-testid="stHeader"] { background: transparent; }
        [data-testid="stMainBlockContainer"] { max-width: 1190px; padding-top: 2rem; padding-bottom: 3rem; }
        h1, h2, h3 { color: var(--workspace-ink); font-family: 'Manrope', sans-serif !important; letter-spacing: -.04em; }
        h1 { font-size: clamp(2rem, 3vw, 2.65rem) !important; font-weight: 800 !important; margin: .15rem 0 .35rem !important; }
        h2 { font-size: 1.45rem !important; font-weight: 750 !important; }
        h3 { font-size: 1.12rem !important; font-weight: 700 !important; }
        [data-testid="stSidebar"] { background: #f0f4ef; border-right: 1px solid var(--workspace-line); }
        [data-testid="stSidebarNav"] { padding-top: .8rem; }
        [data-testid="stFileUploader"] section,
        [data-testid="stTextArea"] textarea,
        [data-testid="stTextInput"] input,
        [data-testid="stSelectbox"] [data-baseweb="select"] > div {
          border-color: #dce7e0; border-radius: 12px; background: #fff; transition: border-color .16s ease, box-shadow .16s ease;
        }
        [data-testid="stTextArea"] textarea:focus, [data-testid="stTextInput"] input:focus,
        [data-testid="stSelectbox"] [data-baseweb="select"] > div:focus-within {
          border-color: #72ad98; box-shadow: 0 0 0 3px rgba(20,125,104,.1);
        }
        [data-testid="stFileUploader"] section { background: #fff; }
        [data-testid="stVerticalBlockBorderWrapper"] {
          border-color: var(--workspace-line); border-radius: 18px; background: #fff;
          box-shadow: 0 5px 18px rgba(26,54,42,.035);
        }
        [data-testid="stMetric"] {
          padding: 15px 17px; border: 1px solid var(--workspace-line);
          border-radius: 15px; background: #fff;
        }
        [data-testid="stMetricLabel"] { color: var(--workspace-muted); }
        [data-testid="stMetricValue"] { color: var(--workspace-ink); }
        .stButton > button, [data-testid="stPageLink"] a, .stDownloadButton > button {
          border-radius: 11px; font-weight: 650; transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }
        [data-testid="stPageLink"] a { justify-content: center; min-height: 2.65rem; padding: .5rem .65rem; border: 1px solid var(--workspace-line); color: var(--workspace-ink); background: #fff; font-size: .82rem; }
        [data-testid="stPageLink"] a:hover { border-color: #bdd8cb; color: var(--workspace-green); background: #f3f8f4; }
        .stButton > button { min-height: 2.55rem; }
        .stButton > button:not([kind="primary"]):hover { border-color: #bdd8cb; color: var(--workspace-green); background: #f6faf7; }
        .stButton > button[kind="primary"] {
          border-color: var(--workspace-green); color: white; background: var(--workspace-green);
        }
        .stButton > button[kind="primary"]:hover { border-color: #0e5b4d; background: #0e5b4d; }
        [data-testid="stExpander"] {
          border-color: var(--workspace-line); border-radius: 14px; background: #fff; overflow: hidden;
        }
        [data-testid="stDataFrame"] { border: 1px solid var(--workspace-line); border-radius: 14px; overflow: hidden; }
        .workspace-eyebrow { margin: 0 0 6px; color: var(--workspace-green); font-size: 10px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
        .workspace-description { max-width: 680px; margin: 0 0 8px; color: var(--workspace-muted); font-size: 14px; line-height: 1.65; }
        .workspace-caption { color: var(--workspace-muted); font-size: .82rem; }
        @media (max-width: 700px) {
          [data-testid="stMainBlockContainer"] { padding: 1rem 1rem 2rem; }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_page_header(st, title: str, description: str, eyebrow: str = "Career workspace") -> None:
    """Render a consistent page title and a visible navigation strip."""
    def open_dashboard() -> None:
        st.switch_page("app.py")

    nav = st.columns(5, gap="small")
    with nav[0]:
        st.button("Dashboard", on_click=open_dashboard, use_container_width=True)
    with nav[1]:
        st.page_link("pages/1_Resume_and_ATS.py", label="Resume & ATS", use_container_width=True)
    with nav[2]:
        st.page_link("pages/2_Job_Search.py", label="Job Search", use_container_width=True)
    with nav[3]:
        st.page_link("pages/3_Tracker.py", label="Tracker", use_container_width=True)
    with nav[4]:
        st.page_link("pages/4_Mock_Interview.py", label="Interview", use_container_width=True)

    st.markdown(
        f'<div class="workspace-eyebrow">{eyebrow}</div><h1>{title}</h1>'
        f'<p class="workspace-description">{description}</p>',
        unsafe_allow_html=True,
    )

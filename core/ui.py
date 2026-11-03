"""Shared visual styling and page header for the Streamlit workspace."""

from __future__ import annotations


NAVIGATION = (
    ("Dashboard", "/"),
    ("Resume & ATS", "/Resume_and_ATS"),
    ("Job Search", "/Job_Search"),
    ("Tracker", "/Tracker"),
    ("Mock Interview", "/Mock_Interview"),
)


def render_site_navigation(st) -> None:
    """Render the shared HTML/CSS/JS navigation in the main page DOM."""
    links = "".join(
        f'<a class="career-nav-link" href="{path}">{label}</a>'
        for label, path in NAVIGATION
    )
    st.html(
        f"""
        <style>
          .career-nav {{ display:flex; align-items:center; justify-content:space-between; gap:18px; margin:0 0 30px; padding:10px 12px 10px 16px; border:1px solid #e4e9f2; border-radius:14px; background:rgba(255,255,255,.9); box-shadow:0 3px 12px rgba(29,43,74,.035); }}
          .career-nav-brand {{ display:flex; align-items:center; gap:10px; color:#17243b; font:800 14px 'Manrope',sans-serif; letter-spacing:-.03em; white-space:nowrap; }}
          .career-nav-mark {{ display:grid; place-items:center; width:32px; height:32px; border-radius:10px; color:#fff; background:#355fe8; font-size:11px; letter-spacing:.04em; }}
          .career-nav-links {{ display:flex; flex-wrap:wrap; justify-content:flex-end; gap:3px; }}
          .career-nav-link {{ padding:9px 12px; border-radius:9px; color:#69758c; font:650 12px 'DM Sans',sans-serif; text-decoration:none; transition:color .15s ease,background .15s ease; }}
          .career-nav-link:hover,.career-nav-link.active {{ color:#294fc9; background:#eef2ff; }}
          @media(max-width:720px) {{ .career-nav {{ align-items:flex-start; flex-direction:column; gap:8px; }} .career-nav-links {{ justify-content:flex-start; }} .career-nav-link {{ padding:8px 9px; }} }}
        </style>
        <nav class="career-nav" aria-label="Career Assistant navigation">
          <div class="career-nav-brand"><span class="career-nav-mark">CA</span><span>Career Assistant</span></div>
          <div class="career-nav-links">{links}</div>
        </nav>
        <script>
          (() => {{
            const current = window.location.pathname.replace(/\\/$/, "") || "/";
            document.querySelectorAll(".career-nav-link").forEach((link) => {{
              const route = new URL(link.href, window.location.href).pathname.replace(/\\/$/, "") || "/";
              if (route === current) {{ link.classList.add("active"); link.setAttribute("aria-current", "page"); }}
            }});
          }})();
        </script>
        """,
        unsafe_allow_javascript=True,
    )


def apply_workspace_styles(st) -> None:
    """Give every multipage screen the same calm, readable visual baseline."""
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        :root {
          --workspace-ink: #17243b;
          --workspace-muted: #69758c;
          --workspace-green: #355fe8;
          --workspace-line: #e4e9f2;
          --workspace-paper: #f5f7fb;
        }
        .stApp { background: var(--workspace-paper); color: var(--workspace-ink); }
        .stApp, .stApp p, .stApp label { font-family: 'DM Sans', sans-serif; }
        [data-testid="stHeader"] { background: transparent; }
        [data-testid="stMainBlockContainer"] { max-width: 1190px; padding-top: 2rem; padding-bottom: 3rem; }
        h1, h2, h3 { color: var(--workspace-ink); font-family: 'Manrope', sans-serif !important; letter-spacing: -.04em; }
        h1 { font-size: clamp(2rem, 3vw, 2.65rem) !important; font-weight: 800 !important; margin: .15rem 0 .35rem !important; }
        h2 { font-size: 1.45rem !important; font-weight: 750 !important; }
        h3 { font-size: 1.12rem !important; font-weight: 700 !important; }
        [data-testid="stSidebar"] { background: #f0f3f9; border-right: 1px solid var(--workspace-line); }
        [data-testid="stSidebarNav"] { padding-top: .8rem; }
        [data-testid="stFileUploader"] section,
        [data-testid="stTextArea"] textarea,
        [data-testid="stTextInput"] input,
        [data-testid="stSelectbox"] [data-baseweb="select"] > div {
          border-color: #dce3ef; border-radius: 10px; background: #fff; transition: border-color .16s ease, box-shadow .16s ease;
        }
        [data-testid="stTextArea"] textarea:focus, [data-testid="stTextInput"] input:focus,
        [data-testid="stSelectbox"] [data-baseweb="select"] > div:focus-within {
          border-color: #7793f4; box-shadow: 0 0 0 3px rgba(53,95,232,.1);
        }
        [data-testid="stFileUploader"] section { background: #fff; }
        [data-testid="stVerticalBlockBorderWrapper"] {
          border-color: var(--workspace-line); border-radius: 15px; background: #fff;
          box-shadow: 0 3px 12px rgba(29,43,74,.035);
        }
        [data-testid="stMetric"] {
          padding: 15px 17px; border: 1px solid var(--workspace-line);
          border-radius: 12px; background: #fff;
        }
        [data-testid="stMetricLabel"] { color: var(--workspace-muted); }
        [data-testid="stMetricValue"] { color: var(--workspace-ink); }
        .stButton > button, [data-testid="stPageLink"] a, .stDownloadButton > button {
          border-radius: 11px; font-weight: 650; transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }
        [data-testid="stPageLink"] a { justify-content: center; min-height: 2.65rem; padding: .5rem .65rem; border: 1px solid var(--workspace-line); color: var(--workspace-ink); background: #fff; font-size: .82rem; }
        [data-testid="stPageLink"] a:hover { border-color: #c8d3fb; color: var(--workspace-green); background: #f4f6ff; }
        .stButton > button { min-height: 2.55rem; }
        .stButton > button:not([kind="primary"]):hover { border-color: #c8d3fb; color: var(--workspace-green); background: #f4f6ff; }
        .stButton > button[kind="primary"] {
          border-color: var(--workspace-green); color: white; background: var(--workspace-green);
          box-shadow: 0 4px 10px rgba(53,95,232,.18);
        }
        .stButton > button[kind="primary"]:hover { border-color: #294fc9; background: #294fc9; }
        [data-testid="stExpander"] {
          border-color: var(--workspace-line); border-radius: 14px; background: #fff; overflow: hidden;
        }
        [data-testid="stDataFrame"] { border: 1px solid var(--workspace-line); border-radius: 14px; overflow: hidden; }
        .workspace-eyebrow { margin: 0 0 7px; color: var(--workspace-green); font-size: 10px; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
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
    """Render shared site navigation and a clear page title."""
    render_site_navigation(st)
    st.markdown(
        f'<div class="workspace-eyebrow">{eyebrow}</div><h1>{title}</h1>'
        f'<p class="workspace-description">{description}</p>',
        unsafe_allow_html=True,
    )

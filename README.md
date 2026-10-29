# Career Assistant

A Streamlit workspace for resume analysis, job search, application tracking, and mock interviews.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run app.py
```

The app works with the CSV fallback out of the box. Copy `.env.example` to `.env` only when enabling optional API, model, or SMTP integrations.

## Layout

- `core/` contains parsing, security, scoring, tailoring, interview, scam, roadmap, retrieval, and orchestration logic.
- `services/` contains job, email, database, and export integrations.
- `schemas/` contains shared Pydantic models.
- `pages/` contains the four Streamlit pages.
- `tests/` contains unit tests and an evaluation-fixture location.

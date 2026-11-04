# Career Assistant

A browser based career workspace for resume analysis, job search, application tracking, and mock interviews. The interface is built with HTML, CSS, and JavaScript; the local Python server connects it to the career tools.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Set `CAREER_HOST` or `CAREER_PORT` to change the local server address.

The app works with the CSV fallback out of the box. Copy `.env.example` to `.env` only when enabling optional API, model, or SMTP integrations.

## AI career coaching

Copy `.env.example` to `.env` and set either `GEMINI_API_KEY` (optionally `GEMINI_MODEL`) or `OPENAI_API_KEY` (optionally `OPENAI_MODEL`) to enable the resume-to-job review and detailed mock interview coaching. If both provider keys are set, Gemini is used. Without a key, ATS scoring and basic interview feedback continue to work offline. AI resume reviews redact detected personal information before sending text to the configured model; resume and job text is otherwise processed by that provider. Treat generated rewrites as suggestions and verify that every claim accurately reflects your experience. The `.env` file is ignored by Git so provider keys stay local.

## Layout

- `web/` contains the HTML, CSS, and JavaScript interface.
- `server.py` serves the interface and local JSON API.
- `core/` contains parsing, security, scoring, tailoring, interview, scam, roadmap, retrieval, and orchestration logic.
- `services/` contains job, email, database, and export integrations.
- `schemas/` contains shared Pydantic models.
- `pages/` contains the four Streamlit pages.
- `tests/` contains unit tests and an evaluation-fixture location.




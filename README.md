# Career Assistant

A responsive AI-powered career workspace for career guidance, resume building and analysis, job recommendations, skill planning, interview practice, and application tracking. The frontend uses React, Vite, Tailwind CSS, and Lucide React; the local Python server connects it to the career tools.

The workspace opens on a personalized dashboard, with an optional product landing page available from the Northstar logo. The dashboard brings together readiness, career paths, skill progress, recommendations, and next steps.

## Run locally

```powershell
node --version # Node.js 20 or newer
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd web
npm install
npm run build
cd ..
python server.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Set `CAREER_HOST` or `CAREER_PORT` to change the local server address.

For frontend development, run `npm run dev` from `web/` and run `python server.py` in a second terminal. Vite forwards `/api` requests to the Python server. The production server serves `web/dist` after a build.

The app works with the CSV fallback out of the box. Copy `.env.example` to `.env` only when enabling optional API, model, or SMTP integrations.

## AI career coaching

Copy `.env.example` to `.env` and set either `GEMINI_API_KEY` (optionally `GEMINI_MODEL`) or `OPENAI_API_KEY` (optionally `OPENAI_MODEL`) to enable the resume-to-job review and detailed mock interview coaching. If both provider keys are set, Gemini is used. Without a key, ATS scoring and basic interview feedback continue to work offline. AI resume reviews redact detected personal information before sending text to the configured model; resume and job text is otherwise processed by that provider. Treat generated rewrites as suggestions and verify that every claim accurately reflects your experience. The `.env` file is ignored by Git so provider keys stay local.

## Layout

- `web/src/` contains the reusable React workspace and its views; `web/src/styles.css` and `web/src/landing.css` provide responsive styling.
- `web/` contains the Vite configuration and production build output.
- `server.py` serves the interface and local JSON API.
- `core/` contains parsing, security, scoring, tailoring, interview, scam, roadmap, retrieval, and orchestration logic.
- `services/` contains job, email, database, and export integrations.
- `schemas/` contains shared Pydantic models.
- `pages/` contains the four Streamlit pages.
- `tests/` contains unit tests and an evaluation-fixture location.




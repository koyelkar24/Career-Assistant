# Northstar Career Studio (Career Assistant)

A local-first career workspace: resume building and ATS review, AI career coaching, job
recommendations with scam screening, skill-gap analysis, a learning roadmap, mock interviews,
and an application tracker — all in one app.

The backend is plain Python (standard-library HTTP server plus a handful of optional
integrations). The frontend is pure HTML, CSS and JavaScript: no Node.js, no bundler, no build
step. Everything runs on your computer, and the database is a single SQLite file next to the
code.

---

## Table of contents

- [Quick start](#quick-start)
- [What you get](#what-you-get)
- [Configuration](#configuration)
- [How it works](#how-it-works)
- [HTTP API](#http-api)
- [Project layout](#project-layout)
- [Core modules](#core-modules)
- [Service modules](#service-modules)
- [Data and storage](#data-and-storage)
- [Security and privacy](#security-and-privacy)
- [Tests](#tests)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

---

## Quick start

### Requirements

- **Python 3.10 or newer** (`python --version`)
- A modern browser (Chrome, Edge, Firefox, Safari)
- No Node.js and no frontend build step

### Windows (PowerShell)

```powershell
cd Career-Assistant
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

If PowerShell blocks the activation script, either allow it for the current session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

or skip the virtual environment entirely and run `python app.py` with your global Python after
`pip install -r requirements.txt`.

### macOS / Linux

```bash
cd Career-Assistant
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Using the app

`app.py` starts the server, prints the address, and opens your default browser
(`http://127.0.0.1:8000`). Leave the terminal open while you use the site; press **Ctrl+C** to
stop it.

Command-line options:

```text
python app.py --help

--host TEXT      Interface to bind (default 127.0.0.1, env CAREER_HOST)
--port INT       Port to listen on (default 8000, env CAREER_PORT)
--no-browser     Do not open a browser tab automatically
```

Examples:

```bash
python app.py --port 8080
python app.py --host 0.0.0.0 --no-browser   # reachable from your local network
CAREER_PORT=9000 python app.py              # macOS/Linux
```

> Binding to `0.0.0.0` exposes the app to other devices on your network. The app has no
> transport encryption and no server-side sessions, so prefer the default loopback address
> unless you understand the trade-off.

`python server.py` also works: it starts the same handler directly but never opens a browser.

### First run

1. The sign-in screen appears. Create a local account (name, target role, email, password of at
   least 6 characters) or choose **Demo Workspace** to browse with sample data and no account.
2. Select the **northstar** logo in the sidebar to open the Overview page.
3. To enable AI features, add an API key — see [Configuration](#configuration). The rest of the
   app works without one.

---

## What you get

Eleven screens, routed by URL hash (`#overview`, `#jobs`, …):

| Page | Hash | What it does |
| --- | --- | --- |
| Overview | `#overview` | Greeting, career-readiness ring, metric cards, suggested paths, skill bars, upcoming tasks, activity streak. |
| AI Career Guidance | `#guidance` | Chat with a career coach. Uses Gemini/OpenAI when configured; otherwise returns a guided offline reply. Includes canned prompt buttons and example conversation threads. |
| Resume Builder | `#resume-builder` | Live-editing resume with three layouts (Modern, Classic, Creative), full preview modal, `.txt` download and Print → Save as PDF. Drafts persist in the browser. |
| Resume Analyzer | `#resume-analyzer` | Upload a `.txt`/`.pdf`/`.docx` resume, optionally paste a job description, and get section structure, a security scan, an ATS score with matched/missing keywords, plus optional AI coach feedback. |
| Job Recommendations | `#jobs` | Search jobs (JSearch when a key is set, bundled CSV otherwise), filter by remote/saved, match badges, scam-signal warnings, save-to-tracker and open-posting actions. |
| Skill Gap Analysis | `#skills` | Compares your skills against a target role profile and highlights the highest-leverage gap. |
| Interview Preparation | `#interview` | Generates role-specific practice questions, scores an answer with an offline STAR heuristic, and adds an AI review when configured. |
| Learning Roadmap | `#roadmap` | A three-week plan built around design systems, data-informed design and leading with influence; progress is tracked in the browser. |
| Application Tracker | `#tracker` | Applications stored in SQLite via `GET`/`POST /api/tracker`, with statuses Saved, Applied, Interview, Offer and Rejected. |
| Profile | `#profile` | Editable name, role, location, goal, experience and preference, stored locally. |
| Settings | `#settings` | Local notification/privacy style toggles, stored in `localStorage`. |

Offline behaviour: scoring, resume parsing, interview heuristics, job search (CSV), account
handling and the tracker need no internet. AI chat, AI resume coaching and AI interview reviews
require a provider key. Job search uses the bundled CSV unless `RAPIDAPI_KEY` is set.

---

## Configuration

Copy the example environment file and edit it:

```powershell
copy .env.example .env      # Windows
cp .env.example .env        # macOS/Linux
```

`core/llm.py` loads `.env` at import time with `python-dotenv`. Real environment variables are
also read, so either approach works. `.env` is listed in `.gitignore`.

| Variable | Purpose | Default |
| --- | --- | --- |
| `GEMINI_API_KEY` | Google Gemini key. Takes precedence when both providers are set. | — |
| `GEMINI_MODEL` | Gemini model name. | `gemini-3.8-flash` |
| `OPENAI_API_KEY` | OpenAI key (used with the `openai` package's Responses API). | — |
| `OPENAI_MODEL` | OpenAI model name. | `gpt-4o-mini` |
| `RAPIDAPI_KEY` | JSearch (RapidAPI) key for live job postings. | — (CSV fallback) |
| `SMTP_HOST` | SMTP server for `services/email_sender.py`. | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port. | `587` |
| `SMTP_USER` | SMTP username / from-address. | — |
| `SMTP_PASSWORD` | SMTP password or app password. | — |
| `CAREER_HOST` | Default bind interface for `app.py`/`server.py`. | `127.0.0.1` |
| `CAREER_PORT` | Default port. | `8000` |

Notes:

- With both AI keys present, Gemini wins. Without either key, `is_configured()` returns false and
  the UI switches to offline mode; the app never fails because AI is missing.
- Gemini 3-family models receive `thinkingConfig.thinkingLevel = "low"` because these prompts are
  short and structured; older model families do not accept that setting.
- For SMTP with Gmail, use an app password rather than your account password.
- Never commit `.env`. If you paste a key into a bug report, rotate it.

---

## How it works

```text
browser (web/)
   │  fetch /api/*
   ▼
server.py  —  BaseHTTPRequestHandler
   │
   ├── core/      parsing, scoring, security, AI prompts, heuristics
   ├── services/  SQLite, job search, exports, email
   └── schemas/   Pydantic models
```

1. `app.py` parses CLI/env options, changes the working directory to the project root, imports
   `server.Handler`, and starts a `ThreadingHTTPServer`. On Windows it disables
   `allow_reuse_address` so a second copy cannot silently bind an occupied port.
2. `server.py` serves static files from `web/` for any non-API path, falling back to
   `index.html` for unknown routes. Path traversal is blocked by resolving the target and
   checking it stays inside `web/`.
3. A single `Database` instance (`career_assistant.db`) is created at import time and shared by
   the handler.
4. The frontend (`web/js/app.js`) renders each page into `#page-wrap` based on the URL hash,
   calling the API with `fetch`. `web/js/state.js` holds defaults, seed data, localStorage
   helpers and small UI utilities; `web/js/pages.js` holds the page renderers.

Requests are JSON (`application/json`) except `/api/resume/analyze`, which accepts
`multipart/form-data` with a `resume` file part and an optional `job_description` text part.
Uploads are capped at **12 MB** and must be `.txt`, `.pdf` or `.docx`.

---

## HTTP API

All endpoints are same-origin under `/api/`. Responses are JSON with `Cache-Control: no-store`.
Errors return `{"error": "..."}` with status **400** for validation problems and **500** for
unexpected failures.

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/status` | — | `{"ai_enabled": bool}` |
| GET | `/api/tracker` | — | `{"applications": [...]}` |
| POST | `/api/auth/register` | `{name, role, email, password}` | `201 {"user": {id, name, role, email}}` |
| POST | `/api/auth/login` | `{email, password}` | `{"user": {id, name, role, email}}` |
| POST | `/api/resume/analyze` | multipart: `resume`, `job_description` | `{resume, security, score}` |
| POST | `/api/resume/coach` | `{resume, job_description}` | `{fit_summary, strengths, gaps, actions, bullet_rewrites}` |
| POST | `/api/career/chat` | `{message}` | `{reply, ai_enabled}` |
| POST | `/api/jobs/search` | `{query, location}` | `{"jobs": [{...job, safety}]}` |
| POST | `/api/tracker` | `{title, company, status, notes}` | `201 {id, applications}` |
| POST | `/api/interview/questions` | `{role, count}` | `{"questions": [{question, category}]}` |
| POST | `/api/interview/feedback` | `{answer, role, question}` | `{score, word_count, signals, feedback, ai_review?}` |

Details worth knowing:

- **`/api/resume/analyze`** parses the file, runs the security scan on the raw text, and scores
  it only when a job description is supplied (`score` is `null` otherwise). `security` contains
  `findings`, `injection` and `hidden_text`.
- **`/api/tracker` (POST)** validates that title and company are non-empty and that status is one
  of `Saved`, `Applied`, `Interview`, `Offer`, `Rejected`. Strings are length-limited (title and
  company 200 chars, notes 2000).
- **`/api/interview/questions`** clamps `count` to 1–5 and caps `role` at 200 characters.
- **`/api/career/chat`** rejects empty messages and caps input at 2000 characters. Without a
  provider key it returns a static coaching reply with `ai_enabled: false`.
- **`/api/jobs/search`** tries JSearch first when `RAPIDAPI_KEY` is set, then falls back to
  `data/jobs.csv`. Every result is passed through the scam detector to add a `safety` object.
- **`/api/auth/*`** hashes passwords with PBKDF2-HMAC-SHA256 (120,000 iterations, per-user random
  salt) and compares them in constant time. It issues **no token or cookie**; the browser stores
  the returned user object. See [Known limitations](#known-limitations).

Example requests:

```bash
curl http://127.0.0.1:8000/api/status

curl -X POST http://127.0.0.1:8000/api/jobs/search \
  -H "Content-Type: application/json" \
  -d '{"query":"python developer","location":"remote"}'

curl -X POST http://127.0.0.1:8000/api/resume/analyze \
  -F "resume=@resume.pdf" \
  -F "job_description=We are hiring a Python developer with SQL and Git experience."
```

Static paths: `/` serves `web/index.html`; `/styles.css`, `/landing.css` and `/js/*.js` are served
from `web/`. Unknown non-API paths return `index.html` so deep links keep working.

---

## Project layout

```text
Career-Assistant/
├── app.py                   # Entry point: CLI options, server lifecycle, opens browser
├── server.py                # HTTP handler, static file serving, REST API
├── requirements.txt
├── .env.example
├── career_assistant.db      # SQLite database (created on first run)
├── data/
│   └── jobs.csv             # Offline job sample data (id,title,company,location,url,description)
├── web/
│   ├── index.html           # Auth screens, app shell, sidebar, router target
│   ├── styles.css           # Application styles
│   ├── landing.css          # Sign-in / showcase styles
│   └── js/
│       ├── app.js           # Bootstrap, navigation, routing, modals, toasts
│       ├── pages.js         # Page renderers (overview, resume, jobs, tracker, …)
│       ├── state.js         # Defaults, seed data, API helper, localStorage, formatting
│       └── icons.js         # Inline SVG icon set
├── core/
│   ├── parser.py            # TXT/PDF/DOCX loading and resume section detection
│   ├── scorer.py            # Deterministic ATS scoring
│   ├── security.py          # PII redaction, prompt-injection scan, hidden-text detection
│   ├── llm.py               # Provider boundary with retries and an in-memory cache
│   ├── coach.py             # Grounded AI resume review (JSON contract)
│   ├── interview.py         # Question bank, STAR heuristics, optional AI review
│   ├── scam_detector.py     # Job-posting red flags
│   ├── tailor.py            # Conservative summary tailoring + grounding check
│   ├── cover_letter.py      # Template-based cover letter
│   ├── roadmap.py           # Skill-gap roadmap items
│   ├── rag.py               # Optional Chroma retrieval helpers
│   └── graph.py             # Optional LangGraph adapter
├── services/
│   ├── db.py                # SQLite: users, applications, cache
│   ├── jobs_api.py          # JSearch + CSV fallback search
│   ├── export.py            # DOCX/PDF export helpers
│   └── email_sender.py      # SMTP delivery
├── schemas/
│   └── models.py            # Resume, Job, ATSScore, Application, InterviewQuestion, RoadmapItem
├── prompts/                 # Model-facing templates (tailoring, cover letters) + README
├── tests/                   # pytest suite (+ eval_pairs notes)
└── txt                      # Architecture sketch kept from early planning
```

---

## Core modules

### `core/parser.py`

`load_text()` extracts text from bytes or a path: `.pdf` via `pdfplumber`, `.docx` via
`python-docx`, anything else decoded as UTF-8 with replacement characters. `parse_resume()` then
builds a predictable structure:

```python
{
  "name": "First non-empty header line",
  "contact": {"email": "...", "phone": "..."},
  "sections": {"summary": [...], "experience": [...], ...},
  "sections_detected": ["summary", "experience", "skills"],
  "raw_text": "..."
}
```

Section headings are matched against aliases (for example *profile*, *work history*, *core
competencies*), tolerating trailing colons, pipes, dashes and parentheticals. Nothing is invented:
missing sections stay as empty lists.

### `core/scorer.py`

Deterministic, offline ATS scoring that returns an `ATSScore`:

- **Keyword match (60% weight)** — tokenizes resume and job description, drops stopwords, and
  normalizes common job-posting typos (`devolopment` → `development`, `javascipt` → `javascript`,
  …). Missing keywords are capped at 20.
- **Section completeness (25%)** — fraction of the expected headings actually detected: summary,
  experience, education, skills. If no structured sections exist, it falls back to a length
  heuristic.
- **Readability (15%)** — based on average sentence length, full marks between 8 and 24 words.

Suggestions are generated for missing keywords, missing headings, low readability, and normalized
typos in the job description. Results are clamped to 0–100 by the Pydantic model.

### `core/security.py`

`inspect_text(text)` returns a `SecurityReport`:

- `redact_pii()` replaces emails, phone numbers, US SSNs and URLs with `[REDACTED]` and reports
  counts.
- `scan_prompt_injection()` looks for instruction-override phrasing, fake system messages,
  prompt-reveal requests and embedded `<script>`/`<iframe>`.
- `detect_hidden_text()` flags zero-width characters, bidi overrides, BOMs and control bytes.

### `core/llm.py`

One boundary for model calls, with a provider-aware in-memory cache keyed by SHA-256 of provider,
model and prompt.

- Gemini: `POST /v1beta/models/{model}:generateContent` with `x-goog-api-key`; non-2xx bodies are
  surfaced as readable errors; 5xx responses are retried with exponential backoff.
- OpenAI: the `openai` package's `client.responses.create(...)`, retried the same way.
- Timeouts produce an explicit "provider took too long" message instead of a generic failure.

### `core/coach.py`

Builds a strict JSON-only prompt (fit summary, up to 4 strengths, 5 gaps, 5 actions, 3 bullet
rewrites), passes inputs through `inspect_text`, marks detected instruction-like text as untrusted,
and validates the shape of the reply. A malformed reply raises a readable error rather than
leaking raw model output into the UI.

### `core/interview.py`

Five question templates (opening, technical, two behavioral, closing) with categories. Offline
feedback scores presence of situation, personal action and result signals out of 100. When AI is
configured, it additionally asks for a JSON review with relevance, specificity, contribution and
outcome.

### `core/scam_detector.py`

Pattern-based red flags: upfront payment for training/equipment, guaranteed income, crypto/gift
cards/wire transfers, and unusual contact channels. It returns a 0–100 risk score, `high` at 50+,
`medium` for any flag, and a "verify the employer" recommendation. This is a warning system, not a
verdict.

### `core/tailor.py`, `core/cover_letter.py`, `core/roadmap.py`

Helpers used by tests and available for scripting: a conservative summary tailorer, a
number-grounding check (`grounding_check`) that flags invented metrics, a template cover letter,
and roadmap generation from missing keywords (first three get `high` priority).

### `core/rag.py`, `core/graph.py`

Optional integrations, both off by default. `rag.py` needs `chromadb`; `graph.py` compiles a
one-node LangGraph flow when `langgraph` is installed and returns `None` otherwise. The commented
lines in `requirements.txt` are how you opt in.

---

## Service modules

### `services/db.py`

SQLite with `sqlite3.Row` results. Tables are created on first import:

```sql
applications(id, job_id, title, company, status, applied_on, notes, created_at)
cache(key PRIMARY KEY, value, created_at)
users(id, name, role, email UNIQUE, password_hash, salt, created_at)
```

Methods: `create_user`, `authenticate_user`, `add_application`, `list_applications`,
`set_cache`, `get_cache`. Passwords are normalized (trimmed, lowercased email) and stored only as
PBKDF2 hashes; duplicate emails raise `ValueError`.

### `services/jobs_api.py`

`search_jobs(query, location, limit=10)` calls JSearch with `query in location`, maps results
into `Job` models and silently falls back to `search_csv()` on any failure. CSV search is
case-insensitive, requires every query token to appear in title/company/location/description, and
requires every location token to appear in the location field. Tokens keep `c++`, `.net` and
similar forms.

### `services/export.py`

`export_docx(text, path)` (python-docx) and `export_pdf(text, path)` (reportlab, 110 characters
per line, paginated). Both raise a `RuntimeError` with install guidance if the library is missing.

### `services/email_sender.py`

`send_email(to, subject, body)` with STARTTLS and login. Requires `SMTP_USER` and
`SMTP_PASSWORD` and raises otherwise.

> `export.py` and `email_sender.py` are library helpers: they are not exposed through
> `server.py`. The UI's export paths are browser-side (`.txt` download and Print → Save as PDF).

---

## Data and storage

| What | Where | Notes |
| --- | --- | --- |
| Users | `career_assistant.db` → `users` | PW-hashed, unique email |
| Applications | `career_assistant.db` → `applications` | Shared across local accounts |
| Cache | `career_assistant.db` → `cache` | Generic key/value JSON |
| Resume draft, tasks, saved jobs, profile, settings, notifications | browser `localStorage` (`northstar.*` keys) | Per browser profile |
| Signed-in user | `localStorage` (`northstar.auth`) or `sessionStorage` | Depends on "remember me" |
| Job sample data | `data/jobs.csv` | Read-only |
| Uploaded resumes | memory only | Never written to disk |

Deleting `career_assistant.db` resets accounts and the tracker. Clearing site data resets browser
drafts, profile and settings.

---

## Security and privacy

- **Local by default.** The server binds `127.0.0.1` and serves assets from disk; nothing is
  uploaded unless you call an AI provider or JSearch.
- **Resume analysis stays local.** Parsing, scoring, scam detection and the security scan run in
  Python on your machine.
- **AI calls are opt-in and minimized.** When a key is configured, the relevant resume/job text
  goes to that provider. Contact details are redacted before AI resume review; other resume and
  job text may still be included. Chat messages are sent as-is (the UI warns against sharing
  sensitive details).
- **Untrusted content is labelled.** Resumes, job descriptions, answers and chat messages are
  wrapped in explicit untrusted-data markers, and instruction-like content is flagged so the model
  treats it as data.
- **Static file serving is path-checked.** Resolved targets must stay within `web/`.
- **Upload limits.** 12 MB maximum; only `.txt`, `.pdf`, `.docx`.
- **Secrets.** Keys live in `.env`, which is git-ignored. `career_assistant.db` is a local file and
  is not encrypted — protect it like any other local database.

---

## Tests

The suite uses pytest and needs no network or API keys:

```bash
cd Career-Assistant
python -m pytest -q
```

Coverage:

- `tests/test_scorer.py` — keyword matching, empty-resume safety.
- `tests/test_security.py` — PII redaction, injection detection, hidden characters.
- `tests/test_scam.py` — upfront-payment red flag.
- `tests/test_jobs_api.py` — multi-term CSV search, location filtering, empty results.

`tests/eval_pairs/` is reserved for resume/job-description evaluation pairs (only its README is
checked in). Run pytest from the project root (or with `python -m pytest`) so `core`, `services`
and `schemas` are importable.

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'pydantic'` (or another package)**
Activate the virtual environment and run `pip install -r requirements.txt`. `app.py` prints the
missing package name and the install command when this happens.

**`Could not start Career Assistant on 127.0.0.1:8000`**
Another process owns the port. Use `python app.py --port 8080`. On Windows, port sharing is
intentionally disabled so conflicts are reported instead of silently reusing the socket.

**The browser opens before the page is ready**
Harmless on slow machines; refresh the tab. Use `--no-browser` to open it yourself.

**`Set-ExecutionPolicy` error when activating the venv**
Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that PowerShell window, or
call `.\.venv\Scripts\python.exe app.py` directly.

**AI features say "offline mode"**
No `GEMINI_API_KEY` or `OPENAI_API_KEY` was found. Confirm `.env` sits next to `app.py`, that the
key has no quotes or trailing spaces, and restart the server (`.env` is read at import time).

**`Gemini API request failed (400/403)`**
Check that the model name in `GEMINI_MODEL` exists for your key and that the Generative Language
API is enabled for the project. `403` usually means the key is restricted or invalid.

**AI request timed out**
Provider calls use a 45-second read timeout and do not retry timeouts. Try again later; local
scoring and interview feedback keep working.

**`Choose a resume file to analyze` / unsupported format**
Only `.txt`, `.pdf`, `.docx` are accepted, up to 12 MB. Scanned PDFs without a text layer yield an
empty resume — export a text-based PDF instead.

**Job search only returns sample jobs**
Set `RAPIDAPI_KEY` for live JSearch results; without it the bundled CSV is used and broad queries
can return nothing (for example "astronaut").

**Forgot the local password**
There is no reset flow: stop the server, delete (or back up) `career_assistant.db`, and register a
new account. This also clears the application tracker.

**AI model returned invalid JSON**
The coach and interview reviewers validate the reply. Re-running the request resolves transient
format errors; repeated failures usually mean the configured model is too small for strict JSON.

---

## Known limitations

- **No server-side sessions.** Login returns a user object and the browser keeps it; API routes do
  not authenticate requests, and tracker rows are not scoped per user. Suitable for a single-user
  local tool, not for multi-user or public deployment.
- **No HTTPS.** Intended for loopback or a trusted LAN.
- **Deterministic ATS score is a guide, not a verdict.** It uses keyword overlap, headings and
  sentence length — not a real ATS engine.
- **Several modules are library-only.** Export, email, cover letter, tailoring, roadmap and RAG
  helpers are not wired into the HTTP API. Roadmap and skill-gap content in the UI comes from the
  seeded profiles in `web/js/state.js` rather than the Python module.
- **In-memory model cache** resets on restart and is not size-bounded.
- **Not a hosted service.** This project is designed to run on your computer; there is no
  container, database server or deployment configuration included.

---

## License

See [LICENSE](LICENSE).

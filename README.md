# Career Assistant

Career Assistant (Northstar Career Studio) is a local-first web application for planning your next career move. It brings career guidance, resume building and ATS review, job suggestions, skill gap analysis, learning roadmaps, interview practice, and application tracking into one workspace built with pure HTML, CSS, and JavaScript.

The app opens on the sign-in screen (with a one-click Demo Workspace option). Select the Northstar logo in the sidebar to see the welcome overview page.

## Start the app on Windows

You’ll need **Python 3.10 or newer** installed on your computer. No Node.js or frontend build step is required.

Open PowerShell in the `Career-Assistant` folder and run these commands:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

When the server says it is running, open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Leave the PowerShell window open while you use the website. To stop the server, press **Ctrl+C** in that window.

## Optional AI features

The app works without an AI account. Resume scoring, local account storage, application tracking, and basic STAR interview feedback are available offline. To enable AI career chat, grounded AI resume coaching, and AI interview reviews, add an API key from **Gemini** or **OpenAI** to a file named `.env` in the `Career-Assistant` folder.

To create that file, copy `.env.example` to `.env`, then replace the example value with your key. Keep `.env` private; it is excluded from Git so the key is not added to project changes. If both providers are configured, the app uses Gemini.

When AI feedback is enabled, the relevant text is sent to the provider you configured. Resume reviews remove detected contact details before sending; other resume and job-description text may still be included. Check AI suggestions for accuracy before using them.

## Where things live

- `app.py` starts the local server and opens the workspace in your browser. Use `python app.py --help` to see options such as `--port` and `--no-browser`.
- `web/` contains the pure HTML, CSS, and JavaScript frontend (`index.html`, `styles.css`, `landing.css`, and `js/`).
- `server.py` serves the web files and provides the local REST API for the career tools.
- `core/` and `services/` contain resume parsing, ATS scoring, security scanning, job search, database persistence, and AI coaching logic.
- `data/`, `schemas/`, `prompts/`, and `tests/` contain sample job data, Pydantic models, prompt templates, and unit tests.

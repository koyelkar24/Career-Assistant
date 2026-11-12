# Career Assistant

Career Assistant is a website for planning your next career move. It brings career guidance, resumes, job suggestions, skill development, interview practice, and application tracking into one workspace.

The app opens on the dashboard. Select the Northstar logo in the sidebar to see the welcome page.

## Start the app on Windows

You’ll need **Python 3.10 or newer** and **Node.js 20 or newer** installed on your computer. Node.js includes npm, which installs and builds the website.

Open PowerShell in this project folder and run these commands one at a time:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd web
npm install
npm run build
cd ..
python server.py
```

The first setup can take a few minutes while the required files are downloaded. When the server says it is running, open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Leave the PowerShell window open while you use the website. To stop the server, press **Ctrl+C** in that window.

## Use the app while developing

If you’re changing the website and want to see updates as you work, open two PowerShell windows in the project folder:

1. In the first window, run `python server.py`.
2. In the second window, run `cd web` and then `npm run dev`.
3. Open the local address printed by Vite in the second window.

## Optional AI features

The app works without an AI account. Resume scoring and basic interview feedback are available offline. To enable AI career chat and more detailed resume or interview feedback, add an API key from **Gemini** or **OpenAI** to a file named `.env` in the project folder.

To create that file, copy `.env.example` to `.env`, then replace the example value with your key. Keep `.env` private; it is excluded from Git so the key is not added to project changes. If both providers are configured, the app uses Gemini.

When AI feedback is enabled, the relevant text is sent to the provider you configured. Resume reviews remove detected contact details before sending; other resume and job-description text may still be included. Check AI suggestions for accuracy before using them.

## Where things live

- `web/` contains the website and its design.
- `server.py` runs the local website and connects it to the career tools.
- `core/` and `services/` contain the resume, job, and interview features.
- `data/`, `schemas/`, and `pages/` contain supporting information and other app views.

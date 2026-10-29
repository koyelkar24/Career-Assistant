"""SQLite persistence for the application tracker and cache."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path


class Database:
    def __init__(self, path: str | Path = "career_assistant.db"):
        self.path = str(path)
        self.initialize()

    def _connect(self):
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        return connection

    def initialize(self) -> None:
        with self._connect() as db:
            db.executescript("CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT, title TEXT NOT NULL, company TEXT NOT NULL, status TEXT NOT NULL, applied_on TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);")

    def add_application(self, application: dict) -> int:
        with self._connect() as db:
            cursor = db.execute("INSERT INTO applications(job_id,title,company,status,applied_on,notes) VALUES(?,?,?,?,?,?)", tuple(application.get(key, "") for key in ("job_id", "title", "company", "status", "applied_on", "notes")))
            return int(cursor.lastrowid)

    def list_applications(self) -> list[dict]:
        with self._connect() as db:
            return [dict(row) for row in db.execute("SELECT * FROM applications ORDER BY created_at DESC, id DESC")]

    def set_cache(self, key: str, value: object) -> None:
        with self._connect() as db:
            db.execute("INSERT OR REPLACE INTO cache(key,value) VALUES(?,?)", (key, json.dumps(value)))

    def get_cache(self, key: str):
        with self._connect() as db:
            row = db.execute("SELECT value FROM cache WHERE key=?", (key,)).fetchone()
        return json.loads(row["value"]) if row else None

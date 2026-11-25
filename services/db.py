"""SQLite persistence for the application tracker and cache."""

from __future__ import annotations

import hashlib
import hmac
import json
import secrets
import sqlite3
from pathlib import Path


def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000).hex()


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
            db.executescript(
                "CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT, title TEXT NOT NULL, company TEXT NOT NULL, status TEXT NOT NULL, applied_on TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);"
                "CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);"
                "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);"
            )

    def create_user(self, name: str, role: str, email: str, password: str) -> dict:
        normalized_email = email.strip().lower()
        salt = secrets.token_hex(16)
        password_hash = _hash_password(password, salt)
        with self._connect() as db:
            existing = db.execute("SELECT id FROM users WHERE email=?", (normalized_email,)).fetchone()
            if existing:
                raise ValueError("An account with this email already exists.")
            cursor = db.execute(
                "INSERT INTO users(name, role, email, password_hash, salt) VALUES(?,?,?,?,?)",
                (name.strip(), role.strip() or "Product Designer", normalized_email, password_hash, salt),
            )
            return {
                "id": int(cursor.lastrowid),
                "name": name.strip(),
                "role": role.strip() or "Product Designer",
                "email": normalized_email,
            }

    def authenticate_user(self, email: str, password: str) -> dict:
        normalized_email = email.strip().lower()
        with self._connect() as db:
            row = db.execute(
                "SELECT id, name, role, email, password_hash, salt FROM users WHERE email=?",
                (normalized_email,),
            ).fetchone()
        if not row:
            raise ValueError("Invalid email or password.")
        expected = _hash_password(password, row["salt"])
        if not hmac.compare_digest(expected, row["password_hash"]):
            raise ValueError("Invalid email or password.")
        return {"id": row["id"], "name": row["name"], "role": row["role"], "email": row["email"]}

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

"""SMTP email delivery for optional outbound messages."""

from __future__ import annotations

import os
import smtplib
from email.message import EmailMessage


def send_email(to: str, subject: str, body: str) -> None:
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    sender = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    if not sender or not password:
        raise RuntimeError("Set SMTP_USER and SMTP_PASSWORD before sending email.")
    message = EmailMessage()
    message["From"], message["To"], message["Subject"] = sender, to, subject
    message.set_content(body)
    with smtplib.SMTP(host, port) as smtp:
        smtp.starttls()
        smtp.login(sender, password)
        smtp.send_message(message)

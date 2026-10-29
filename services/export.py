"""Export generated content to DOCX or PDF when optional libraries are installed."""

from __future__ import annotations

from pathlib import Path


def export_docx(text: str, path: str | Path) -> Path:
    try:
        from docx import Document
    except ImportError as exc:
        raise RuntimeError("Install python-docx to export DOCX files.") from exc
    document = Document()
    for paragraph in text.split("\n"):
        document.add_paragraph(paragraph)
    output = Path(path)
    document.save(output)
    return output


def export_pdf(text: str, path: str | Path) -> Path:
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
    except ImportError as exc:
        raise RuntimeError("Install reportlab to export PDF files.") from exc
    output = Path(path)
    pdf = canvas.Canvas(str(output), pagesize=letter)
    y = 750
    for line in text.splitlines():
        pdf.drawString(50, y, line[:110])
        y -= 15
        if y < 50:
            pdf.showPage(); y = 750
    pdf.save()
    return output

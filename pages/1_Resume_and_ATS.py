"""Resume upload, parsing, and ATS scoring page."""

import streamlit as st

from core.parser import parse_resume
from core.scorer import score_resume
from core.security import inspect_text


st.title("Resume & ATS")
uploaded = st.file_uploader("Upload your resume", type=["txt", "pdf", "docx"])
job_description = st.text_area("Paste a job description", height=220)
if uploaded and st.button("Analyze"):
    parsed = parse_resume(uploaded.getvalue(), uploaded.name)
    report = inspect_text(parsed["raw_text"])
    st.session_state.resume = parsed
    if report.findings:
        st.warning("Security checks found: " + ", ".join(report.findings))
    st.subheader("ATS score")
    st.json(score_resume(parsed, job_description).model_dump())

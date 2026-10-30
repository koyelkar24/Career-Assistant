"""Resume upload, parsing, and ATS scoring page."""

import streamlit as st

from core.parser import parse_resume
from core.scorer import score_resume
from core.coach import review_resume
from core.llm import is_configured
from core.security import inspect_text


st.title("Resume & ATS")
uploaded = st.file_uploader("Upload your resume", type=["txt", "pdf", "docx"])
job_description = st.text_area("Paste a job description", height=220)
if uploaded and st.button("Analyze"):
    parsed = parse_resume(uploaded.getvalue(), uploaded.name)
    report = inspect_text(parsed["raw_text"])
    st.session_state.resume = parsed
    st.session_state.resume_security_findings = report.findings
if st.session_state.get("resume"):
    parsed = st.session_state.resume
    report_findings = st.session_state.get("resume_security_findings", [])
    if report_findings:
        st.warning("Security checks found: " + ", ".join(report_findings))
    st.subheader("ATS score")
    st.json(score_resume(parsed, job_description).model_dump())
    if job_description.strip():
        st.subheader("AI career coach")
        if not is_configured():
            st.info("Add OPENAI_API_KEY to your .env file to enable personalized AI feedback. Your ATS score works without it.")
        elif st.button("Get grounded resume feedback"):
            try:
                with st.spinner("Reviewing resume against the role…"):
                    review = review_resume(parsed["raw_text"], job_description)
                st.markdown(review["fit_summary"])
                for title, key in (("Strengths", "strengths"), ("Gaps to address", "gaps"), ("Recommended actions", "actions")):
                    st.markdown(f"**{title}**")
                    for item in review[key]:
                        st.markdown(f"- {item}")
                for item in review["bullet_rewrites"]:
                    with st.expander("Review a suggested bullet rewrite"):
                        st.write("Original:", item.get("original", ""))
                        st.write("Suggestion:", item.get("rewrite", ""))
                        st.caption(item.get("evidence_note", "Check that this stays accurate to your experience."))
                st.caption("Resume text is sent to the configured OpenAI model after email addresses and phone numbers are redacted. Review all suggestions for accuracy.")
            except Exception as exc:
                st.error(str(exc))

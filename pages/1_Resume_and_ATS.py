"""Resume upload, parsing, and ATS scoring page."""

from __future__ import annotations

import streamlit as st

from core.coach import review_resume
from core.llm import is_configured
from core.parser import parse_resume, structure_resume
from core.scorer import score_resume
from core.security import inspect_text
from core.ui import apply_workspace_styles, render_page_header


apply_workspace_styles(st)
render_page_header(st, "Resume & ATS", "Review your resume structure and compare its wording with a specific role.", "Resume studio")
with st.container(border=True):
    st.subheader("Build your review")
    upload_col, role_col = st.columns([1, 1.35], gap="large")
    with upload_col:
        uploaded = st.file_uploader("Your resume", type=["txt", "pdf", "docx"], help="PDF, DOCX, and plain text files are supported.")
        st.caption("Your resume stays in this session unless you request an AI review.")
    with role_col:
        job_description = st.text_area("Target job description", height=170, placeholder="Paste the role description to compare keywords and sections.")

if not uploaded and not st.session_state.get("resume"):
    st.info("Upload a resume to begin. Add a job description for a role-specific ATS overview.")

if uploaded and st.button("Analyze resume", type="primary"):
    try:
        parsed = parse_resume(uploaded.getvalue(), uploaded.name)
        report = inspect_text(parsed["raw_text"])
        st.session_state.resume = parsed
        st.session_state.resume_security_findings = report.findings
        st.session_state.resume_security_flags = {
            "injection": report.injection_detected,
            "hidden_text": report.hidden_text_detected,
        }
    except Exception as exc:
        st.error(f"We couldn't read that file: {exc}")

if st.session_state.get("resume"):
    parsed = st.session_state.resume
    # Upgrade resume data already stored in an active session after the parser
    # gains explicit heading detection; the user does not need to upload again.
    if "sections_detected" not in parsed:
        parsed = structure_resume(parsed.get("raw_text", ""))
        st.session_state.resume = parsed
    findings = st.session_state.get("resume_security_findings", [])
    flags = st.session_state.get("resume_security_flags", {})
    pii_findings = [item for item in findings if item.split(":", 1)[0] in {"email", "phone", "ssn", "url"}]
    other_findings = [item for item in findings if item not in pii_findings]

    if pii_findings:
        counts = ", ".join(f"{item.split(':', 1)[1]} {item.split(':', 1)[0]}" for item in pii_findings)
        st.info(f"Privacy check: found {counts} in the resume. Contact details are normal on a resume; they are redacted before resume text is sent to the AI coach.")
    if other_findings or flags.get("injection") or flags.get("hidden_text"):
        st.warning("The resume contains instruction-like or hidden text. It will be treated as untrusted content during AI review.")

    if job_description.strip():
        result = score_resume(parsed, job_description)
        st.subheader("ATS overview")
        score_col, keyword_col, sections_col, readability_col = st.columns(4)
        score_col.metric("Overall match", f"{result.overall:.1f}%")
        keyword_col.metric("Keyword overlap", f"{result.keyword_match:.1f}%")
        sections_col.metric("Section headings", f"{result.section_completeness:.0f}%")
        readability_col.metric("Readability", f"{result.readability:.0f}%")
        st.caption("This is a local text comparison, not a hiring probability. Use it as a checklist and only add skills you can support with real experience.")

        matched_col, missing_col = st.columns(2)
        with matched_col:
            st.markdown("**Matched terms**")
            st.write(", ".join(result.matched_keywords) if result.matched_keywords else "No matching terms found yet.")
        with missing_col:
            st.markdown("**Terms to review**")
            st.write(", ".join(result.missing_keywords) if result.missing_keywords else "No major keyword gaps found.")

        detected = set(parsed.get("sections_detected", []))
        missing_sections = [name.title() for name in ("summary", "experience", "education", "skills") if name not in detected]
        if missing_sections:
            st.caption("Headings not detected: " + ", ".join(missing_sections) + ". Common heading variations are recognized; use clear section labels for the best result.")
        for suggestion in result.suggestions:
            st.markdown(f"- {suggestion}")

        st.subheader("AI career coach")
        if not is_configured():
            st.info("AI feedback is optional. To enable it, add your own GEMINI_API_KEY or OPENAI_API_KEY to a .env file in the project folder, then restart the app. ATS scoring works without a key.")
        elif st.button("Get grounded resume feedback"):
            try:
                with st.spinner("Reviewing your resume against the role…"):
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
                st.caption("Resume contact details are redacted before AI review. Verify every suggestion before using it.")
            except Exception as exc:
                st.error(str(exc))
    else:
        st.info("Paste a job description above to see your ATS overview.")

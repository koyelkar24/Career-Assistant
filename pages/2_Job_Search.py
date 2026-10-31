"""Job search and scam-check page."""

import streamlit as st

from core.scam_detector import analyze_job
from core.ui import apply_workspace_styles, render_page_header
from services.jobs_api import search_jobs


apply_workspace_styles(st)
render_page_header(st, "Job Search", "Search roles, review the details, and check listings for common warning signs.", "Find opportunities")
with st.container(border=True):
    st.subheader("Search for a role")
    query_col, location_col, action_col = st.columns([1.4, 1, .8], vertical_alignment="bottom")
    query = query_col.text_input("Role or keyword", "software engineer")
    location = location_col.text_input("Location", "")
    search_clicked = action_col.button("Search jobs", type="primary", use_container_width=True)
if search_clicked:
    try:
        jobs = search_jobs(query, location)
        st.session_state.jobs = [job.model_dump() for job in jobs]
        st.session_state.job_search_performed = True
    except Exception as exc:
        st.error(f"Job search failed: {exc}")

if st.session_state.get("jobs"):
    st.subheader(f"{len(st.session_state.jobs)} opportunities")
elif st.session_state.get("job_search_performed"):
    st.info("No matching opportunities came back for that search. Try a broader role title or a different location.")
else:
    st.info("Search by role or keyword to see matching opportunities here.")
for job in st.session_state.get("jobs", []):
    with st.expander(f"{job['title']} — {job['company']}"):
        st.write(job.get("location", ""))
        st.write(job.get("description", ""))
        st.caption(analyze_job(job.get("description", ""))["recommendation"])
        if job.get("url"):
            st.link_button("View posting", job["url"])

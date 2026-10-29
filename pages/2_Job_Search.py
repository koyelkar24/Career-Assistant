"""Job search and scam-check page."""

import streamlit as st

from core.scam_detector import analyze_job
from services.jobs_api import search_jobs


st.title("Job Search")
query = st.text_input("Role or keyword", "software engineer")
location = st.text_input("Location", "")
if st.button("Search jobs"):
    jobs = search_jobs(query, location)
    st.session_state.jobs = [job.model_dump() for job in jobs]
for job in st.session_state.get("jobs", []):
    with st.expander(f"{job['title']} — {job['company']}"):
        st.write(job.get("location", ""))
        st.write(job.get("description", ""))
        st.caption(analyze_job(job.get("description", ""))["recommendation"])
        if job.get("url"):
            st.link_button("View posting", job["url"])

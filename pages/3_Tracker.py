"""Application tracker page."""

import streamlit as st

from core.ui import apply_workspace_styles, render_page_header
from services.db import Database


apply_workspace_styles(st)
render_page_header(st, "Application Tracker", "Keep each application, its current stage, and your follow-up notes in one place.", "Stay organized")
db = Database()
with st.container(border=True):
    st.subheader("Add an application")
    with st.form("new_application", clear_on_submit=True):
        role_col, company_col = st.columns(2)
        title = role_col.text_input("Role")
        company = company_col.text_input("Company")
        status_col, notes_col = st.columns([1, 2])
        status = status_col.selectbox("Status", ["Saved", "Applied", "Interview", "Offer", "Rejected"])
        notes = notes_col.text_input("Next step or note")
        submitted = st.form_submit_button("Add application", type="primary")
    if submitted:
        if title.strip() and company.strip():
            db.add_application({"title": title.strip(), "company": company.strip(), "status": status, "notes": notes})
            st.success("Application added.")
        else:
            st.error("Enter both a role and a company to add an application.")

st.subheader("Your applications")
applications = db.list_applications()
if applications:
    display_rows = [
        {
            "Role": item["title"],
            "Company": item["company"],
            "Status": item["status"],
            "Notes": item.get("notes", ""),
            "Added": item.get("created_at", ""),
        }
        for item in applications
    ]
    st.dataframe(display_rows, use_container_width=True, hide_index=True)
else:
    with st.container(border=True):
        st.markdown("#### Your tracker is ready")
        st.write("Add your first role above. Your saved applications will appear here with their status and notes.")

"""Application tracker page."""

import streamlit as st

from services.db import Database


st.title("Application Tracker")
db = Database()
with st.form("new_application"):
    title = st.text_input("Role")
    company = st.text_input("Company")
    status = st.selectbox("Status", ["Saved", "Applied", "Interview", "Offer", "Rejected"])
    notes = st.text_area("Notes")
    if st.form_submit_button("Add") and title and company:
        db.add_application({"title": title, "company": company, "status": status, "notes": notes})
        st.success("Application added.")
st.dataframe(db.list_applications(), use_container_width=True)

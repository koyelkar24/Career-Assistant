"""Mock interview practice page."""

import streamlit as st

from core.interview import evaluate_answer, generate_questions
from core.llm import is_configured
from core.ui import apply_workspace_styles, render_page_header


apply_workspace_styles(st)
render_page_header(st, "Mock Interview", "Practice realistic questions for your target role and get practical feedback on your answers.", "Practice with confidence")
with st.container(border=True):
    st.subheader("Set up a practice round")
    role_col, count_col = st.columns([2, 1])
    role = role_col.text_input("Target role", "Software Engineer")
    count = count_col.slider("Questions", 1, 5, 3)
if is_configured():
    st.caption("AI coaching is enabled. Contact details are redacted before feedback requests.")
else:
    st.caption("Offline feedback is active. Add a Gemini or OpenAI key in .env to enable detailed coaching.")
questions = generate_questions(role, count)
for index, item in enumerate(questions):
    with st.container(border=True):
        st.markdown(f"#### {index + 1:02d}  {item['question']}")
        answer = st.text_area("Your answer", key=f"answer_{index}", height=150, placeholder="Structure your answer around the situation, your actions, and the outcome.")
        if answer and st.button("Get feedback", key=f"feedback_{index}", type="primary"):
            feedback = evaluate_answer(answer, role=role, question=item["question"])
            st.metric("Answer structure score", f"{feedback['score']}%")
            if "ai_review" in feedback:
                review = feedback["ai_review"]
                st.write(review.get("feedback", ""))
                for label, key in (("What worked", "strengths"), ("Try next", "improvements")):
                    if review.get(key):
                        st.markdown(f"**{label}**")
                        for note in review[key]:
                            st.markdown(f"- {note}")
                if review.get("example_follow_up"):
                    st.info("Practice follow-up: " + str(review["example_follow_up"]))
            else:
                st.write(feedback["feedback"])

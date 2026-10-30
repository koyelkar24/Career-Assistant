"""Mock interview practice page."""

import streamlit as st

from core.interview import evaluate_answer, generate_questions
from core.llm import is_configured


st.title("Mock Interview")
role = st.text_input("Target role", "Software Engineer")
count = st.slider("Questions", 1, 5, 3)
if is_configured():
    st.caption("AI feedback is enabled. Candidate email addresses and phone numbers are redacted before feedback requests.")
else:
    st.caption("Offline feedback is active. Add OPENAI_API_KEY to .env for detailed AI coaching.")
questions = generate_questions(role, count)
for index, item in enumerate(questions):
    st.subheader(f"{index + 1}. {item['question']}")
    answer = st.text_area("Your answer", key=f"answer_{index}")
    if answer and st.button("Get feedback", key=f"feedback_{index}"):
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

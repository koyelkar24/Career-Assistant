"""Mock interview practice page."""

import streamlit as st

from core.interview import evaluate_answer, generate_questions


st.title("Mock Interview")
role = st.text_input("Target role", "Software Engineer")
count = st.slider("Questions", 1, 5, 3)
questions = generate_questions(role, count)
for index, item in enumerate(questions):
    st.subheader(f"{index + 1}. {item['question']}")
    answer = st.text_area("Your answer", key=f"answer_{index}")
    if answer and st.button("Get feedback", key=f"feedback_{index}"):
        st.json(evaluate_answer(answer))

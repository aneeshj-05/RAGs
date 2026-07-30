import time
from google import genai
from google.genai import errors
from config import GEMINI_API_KEY, GEMINI_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

PROMPT = """
You are an intelligent document assistant.

Answer ONLY using the provided context.

If the user asks for a summary or overview, summarize the retrieved context naturally.

If the question asks for a list of items, extract them as a clean bulleted list.

If the answer cannot be found in the context,
say "The uploaded documents do not contain this information."

If the question is conversational or informal, answer naturally and conversationally.

Context:
{context}

Question:
{question}

Answer:
"""

def generate_answer(question, docs):
    context = "\n\n".join(doc.page_content for doc in docs)
    prompt = PROMPT.format(context=context, question=question)

    max_retries = 4
    delay = 2  # seconds, doubles each retry

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )
            return response.text

        except errors.ServerError as e:
            status_code = getattr(e, "status_code", None) or getattr(e, "code", None)
            is_overloaded = status_code == 503 or "503" in str(e) or "UNAVAILABLE" in str(e)

            if is_overloaded and attempt < max_retries - 1:
                print(f"[llm] Model overloaded. Retrying in {delay}s... (attempt {attempt + 1}/{max_retries})")
                time.sleep(delay)
                delay *= 2
            else:
                raise
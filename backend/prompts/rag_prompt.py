"""RAG prompt templates."""

from langchain_core.prompts import ChatPromptTemplate

RAG_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            (
                "You are an intelligent document assistant. Answer only from "
                "the provided context. If the answer cannot be found in the "
                "context, say: \"The uploaded documents do not contain this "
                "information.\" Do not invent facts. If the user asks for a "
                "summary or overview, summarize the retrieved context "
                "naturally. If the question asks for a list, return a clean "
                "bulleted list. Keep conversational answers natural. When "
                "document metadata is available, cite it by filename, page "
                "number, or chunk id where useful."
            ),
        ),
        (
            "human",
            "Context:\n{context}\n\nQuestion:\n{question}\n\nAnswer:",
        ),
    ]
)

"""Configurable document retriever interface."""

from typing import List

from langchain_core.documents import Document

from retrievers.factory import get_active_retriever


def retrieve_with_scores(query: str) -> tuple[List[Document], float]:
    """Retrieve relevant documents and compute confidence score using the active retriever."""
    return get_active_retriever().retrieve_with_scores(query)


def retrieve(query: str) -> List[Document]:
    """Retrieve relevant documents using the active retriever."""
    docs, _ = retrieve_with_scores(query)
    return docs

"""Configurable document retriever."""

import logging
import time
from typing import List

from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStoreRetriever

from config import RETRIEVER_SEARCH_KWARGS, RETRIEVER_SEARCH_TYPE, RETRIEVER_TOP_K

from vectorstore.chroma import vector_store

logger = logging.getLogger(__name__)


def get_retriever() -> VectorStoreRetriever:
    """Create a retriever from the configured vector store settings."""
    return vector_store.as_retriever(
        search_type=RETRIEVER_SEARCH_TYPE,
        search_kwargs=RETRIEVER_SEARCH_KWARGS,
    )


retriever = get_retriever()


def retrieve_with_scores(query: str) -> tuple[List[Document], float]:
    """Retrieve relevant documents and compute confidence score for a query."""
    start = time.perf_counter()
    try:
        results = vector_store.similarity_search_with_relevance_scores(
            query,
            k=RETRIEVER_TOP_K,
        )
    except Exception as exc:
        logger.exception("Similarity search failed: %s", exc)
        results = []


    latency_ms = (time.perf_counter() - start) * 1000

    if not results:
        logger.info("Retrieved 0 chunks in %.2f ms", latency_ms)
        return [], 0.0

    docs = [doc for doc, _ in results]
    scores = [score for _, score in results]

    avg_score = sum(max(0.0, score) for score in scores) / len(scores)
    confidence = round(max(0.0, min(1.0, avg_score)) * 100, 1)

    logger.info("Retrieved %s chunks in %.2f ms (confidence: %.1f%%)", len(docs), latency_ms, confidence)
    return docs, confidence


def retrieve(query: str) -> List[Document]:
    """Retrieve relevant documents for a query."""
    docs, _ = retrieve_with_scores(query)
    return docs


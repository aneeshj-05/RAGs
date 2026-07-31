"""Dense vector retriever implementation using Chroma."""

import logging
import time
from typing import List

from langchain_core.documents import Document

from config import TOP_K_DENSE
from retrievers.base import BaseAppRetriever
from vectorstore.chroma import vector_store

logger = logging.getLogger(__name__)


class DenseAppRetriever(BaseAppRetriever):
    """Dense retriever using Chroma similarity search with relevance scores."""

    def retrieve_with_scores(self, query: str) -> tuple[List[Document], float]:
        start = time.perf_counter()
        try:
            results = vector_store.similarity_search_with_relevance_scores(
                query,
                k=TOP_K_DENSE,
            )
        except Exception as exc:
            logger.exception("Dense similarity search failed: %s", exc)
            results = []

        latency_ms = (time.perf_counter() - start) * 1000

        if not results:
            logger.info("Dense Retrieval - query: '%s', chunk_ids: [], scores: [], latency: %.2f ms", query, latency_ms)
            return [], 0.0

        docs = [doc for doc, _ in results]
        scores = [score for _, score in results]
        chunk_ids = [doc.metadata.get("chunk_id", doc.metadata.get("chunk")) for doc in docs]
        rounded_scores = [round(s, 4) for s in scores]

        avg_score = sum(max(0.0, s) for s in scores) / len(scores)
        confidence = round(max(0.0, min(1.0, avg_score)) * 100, 1)

        logger.info(
            "Dense Retrieval - query: '%s', chunk_ids: %s, scores: %s, latency: %.2f ms (confidence: %.1f%%)",
            query,
            chunk_ids,
            rounded_scores,
            latency_ms,
            confidence,
        )
        return docs, confidence

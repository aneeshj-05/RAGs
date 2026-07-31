"""Sparse BM25 retriever implementation."""

import logging
import time
from typing import List

from langchain_core.documents import Document

from config import TOP_K_DENSE
from retrievers.base import BaseAppRetriever
from vectorstore.bm25 import get_bm25_retriever
from vectorstore.chroma import vector_store

logger = logging.getLogger(__name__)


class SparseAppRetriever(BaseAppRetriever):
    """Sparse retriever using in-memory BM25 keyword matching."""

    def retrieve_with_scores(self, query: str) -> tuple[List[Document], float]:
        start = time.perf_counter()
        bm25_retriever = get_bm25_retriever()
        if not bm25_retriever:
            logger.warning("BM25 retriever is not initialized (no document uploaded).")
            return [], 0.0

        try:
            docs = bm25_retriever.invoke(query)
        except Exception as exc:
            logger.exception("BM25 retrieval failed: %s", exc)
            docs = []

        latency_ms = (time.perf_counter() - start) * 1000
        chunk_ids = [doc.metadata.get("chunk_id", doc.metadata.get("chunk")) for doc in docs]

        logger.info("BM25 Retrieval - query: '%s', chunk_ids: %s, latency: %.2f ms", query, chunk_ids, latency_ms)

        # Confidence is derived strictly from dense vector similarity scores
        confidence = 0.0
        try:
            dense_results = vector_store.similarity_search_with_relevance_scores(query, k=TOP_K_DENSE)
            if dense_results:
                scores = [score for _, score in dense_results]
                avg_score = sum(max(0.0, s) for s in scores) / len(scores)
                confidence = round(max(0.0, min(1.0, avg_score)) * 100, 1)
        except Exception as exc:
            logger.exception("Failed to calculate dense confidence for sparse retrieval: %s", exc)

        return docs, confidence

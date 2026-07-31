"""Hybrid retriever using LangChain EnsembleRetriever (Reciprocal Rank Fusion)."""

import logging
import time
from typing import List

from langchain_classic.retrievers import EnsembleRetriever
from langchain_core.documents import Document

from config import DENSE_WEIGHT, SPARSE_WEIGHT, TOP_K_DENSE, TOP_K_SPARSE
from retrievers.base import BaseAppRetriever
from vectorstore.bm25 import get_bm25_retriever
from vectorstore.chroma import vector_store

logger = logging.getLogger(__name__)


class HybridAppRetriever(BaseAppRetriever):
    """Hybrid retriever combining Chroma dense and BM25 sparse using LangChain EnsembleRetriever (RRF)."""

    def retrieve_with_scores(self, query: str) -> tuple[List[Document], float]:
        start_total = time.perf_counter()

        # 1. Execute Dense search for confidence score calculation and logging
        start_dense = time.perf_counter()
        try:
            dense_results = vector_store.similarity_search_with_relevance_scores(query, k=TOP_K_DENSE)
        except Exception as exc:
            logger.exception("Dense retrieval failed during hybrid search: %s", exc)
            dense_results = []
        dense_latency_ms = (time.perf_counter() - start_dense) * 1000

        dense_docs = [doc for doc, _ in dense_results]
        dense_scores = [score for _, score in dense_results]
        dense_chunk_ids = [doc.metadata.get("chunk_id", doc.metadata.get("chunk")) for doc in dense_docs]
        rounded_dense_scores = [round(s, 4) for s in dense_scores]

        if dense_scores:
            avg_score = sum(max(0.0, s) for s in dense_scores) / len(dense_scores)
            confidence = round(max(0.0, min(1.0, avg_score)) * 100, 1)
        else:
            confidence = 0.0

        logger.info(
            "Dense Retrieval - query: '%s', chunk_ids: %s, scores: %s, latency: %.2f ms",
            query,
            dense_chunk_ids,
            rounded_dense_scores,
            dense_latency_ms,
        )

        # 2. Execute BM25 Sparse search for logging
        bm25_retriever = get_bm25_retriever()
        start_bm25 = time.perf_counter()
        if bm25_retriever:
            try:
                bm25_docs = bm25_retriever.invoke(query)
            except Exception as exc:
                logger.exception("BM25 retrieval failed during hybrid search: %s", exc)
                bm25_docs = []
        else:
            bm25_docs = []
        bm25_latency_ms = (time.perf_counter() - start_bm25) * 1000
        bm25_chunk_ids = [doc.metadata.get("chunk_id", doc.metadata.get("chunk")) for doc in bm25_docs]

        logger.info(
            "BM25 Retrieval - query: '%s', chunk_ids: %s, latency: %.2f ms",
            query,
            bm25_chunk_ids,
            bm25_latency_ms,
        )

        # 3. Execute Hybrid Search using LangChain EnsembleRetriever (RRF)
        start_hybrid = time.perf_counter()
        if bm25_retriever:
            dense_vector_retriever = vector_store.as_retriever(search_kwargs={"k": TOP_K_DENSE})
            ensemble = EnsembleRetriever(
                retrievers=[dense_vector_retriever, bm25_retriever],
                weights=[DENSE_WEIGHT, SPARSE_WEIGHT],
            )
            try:
                final_docs = ensemble.invoke(query)
            except Exception as exc:
                logger.exception("EnsembleRetriever failed, falling back to dense docs: %s", exc)
                final_docs = dense_docs
        else:
            final_docs = dense_docs

        hybrid_latency_ms = (time.perf_counter() - start_hybrid) * 1000
        total_latency_ms = (time.perf_counter() - start_total) * 1000
        hybrid_chunk_ids = [doc.metadata.get("chunk_id", doc.metadata.get("chunk")) for doc in final_docs]

        logger.info(
            "Hybrid Retrieval (RRF) - query: '%s', final chunk_ids: %s, hybrid_latency: %.2f ms, total_latency: %.2f ms (confidence: %.1f%%)",
            query,
            hybrid_chunk_ids,
            hybrid_latency_ms,
            total_latency_ms,
            confidence,
        )

        return final_docs, confidence

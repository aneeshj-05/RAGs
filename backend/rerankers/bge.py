"""BGE Cross-Encoder reranker using sentence-transformers."""

import logging
import time
from typing import List

from langchain_core.documents import Document
from sentence_transformers import CrossEncoder

from rerankers.base import BaseReranker

logger = logging.getLogger(__name__)


class BGEReranker(BaseReranker):
    """Cross-encoder reranker backed by a BAAI/bge-reranker-* model.

    This class is completely retrieval-agnostic – it only knows about a query
    string and a list of ``Document`` objects. It does not import anything from
    the retriever layer.
    """

    def __init__(self, model_name: str) -> None:
        logger.info("Loading cross-encoder model: %s", model_name)
        self._model = CrossEncoder(model_name)
        self._model_name = model_name
        logger.info("Cross-encoder model loaded: %s", model_name)

    def rerank(self, query: str, documents: List[Document], top_n: int) -> List[Document]:
        """Score every candidate with the cross-encoder and return the top-n.

        Logs:
        - Candidate chunk IDs before reranking
        - Cross-encoder score for every candidate
        - Final reranked chunk IDs
        - Top-K selected
        - Reranking latency
        """
        if not documents:
            logger.warning("Reranker received zero candidate documents – skipping.")
            return []

        # ── 1. Log candidate chunk IDs ────────────────────────────────────────
        candidate_ids = [
            doc.metadata.get("chunk_id", doc.metadata.get("chunk", f"doc_{i}"))
            for i, doc in enumerate(documents)
        ]
        logger.info(
            "[Reranker] Candidates before reranking (%d): %s",
            len(candidate_ids),
            candidate_ids,
        )

        # ── 2. Score all candidates ───────────────────────────────────────────
        pairs = [(query, doc.page_content) for doc in documents]
        start = time.perf_counter()
        raw_scores: List[float] = self._model.predict(pairs).tolist()
        latency_ms = (time.perf_counter() - start) * 1000

        # ── 3. Log per-candidate scores ───────────────────────────────────────
        score_log = {cid: round(score, 4) for cid, score in zip(candidate_ids, raw_scores)}
        logger.info("[Reranker] Cross-encoder scores: %s", score_log)
        logger.info("[Reranker] Reranking latency: %.2f ms", latency_ms)

        # ── 4. Sort descending by score ───────────────────────────────────────
        scored = sorted(zip(raw_scores, documents), key=lambda x: x[0], reverse=True)

        # ── 5. Select top-n ───────────────────────────────────────────────────
        top_n = min(top_n, len(scored))
        selected = scored[:top_n]

        # ── 6. Log final selection ────────────────────────────────────────────
        final_ids = [
            doc.metadata.get("chunk_id", doc.metadata.get("chunk", f"doc_{i}"))
            for i, (_, doc) in enumerate(selected)
        ]
        logger.info("[Reranker] Top-%d selected: %s", top_n, final_ids)

        return [doc for _, doc in selected]

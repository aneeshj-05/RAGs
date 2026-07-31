"""In-memory BM25 retriever storage and lifecycle management."""

import logging
from typing import List, Optional

from langchain_community.retrievers.bm25 import BM25Retriever
from langchain_core.documents import Document

from config import TOP_K_SPARSE
from utils.exceptions import VectorStoreError

logger = logging.getLogger(__name__)

_bm25_retriever: Optional[BM25Retriever] = None


def build_bm25_retriever(documents: List[Document]) -> Optional[BM25Retriever]:
    """Build in-memory BM25 retriever from document chunks without duplicate PDF parsing."""
    global _bm25_retriever
    if not documents:
        logger.warning("No documents provided to build BM25 retriever")
        _bm25_retriever = None
        return None

    try:
        retriever = BM25Retriever.from_documents(documents, k=TOP_K_SPARSE)
        _bm25_retriever = retriever
        logger.info("Built in-memory BM25 retriever with %s chunks (k=%s)", len(documents), TOP_K_SPARSE)
        return retriever
    except Exception as exc:
        logger.exception("Failed to build BM25 retriever")
        raise VectorStoreError("Failed to build BM25 index.") from exc


def get_bm25_retriever() -> Optional[BM25Retriever]:
    """Get the active in-memory BM25 retriever."""
    return _bm25_retriever


def clear_bm25_retriever() -> None:
    """Clear the in-memory BM25 retriever."""
    global _bm25_retriever
    _bm25_retriever = None
    logger.info("Cleared in-memory BM25 retriever")

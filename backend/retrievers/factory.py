"""Retriever factory for configuration-driven strategy selection."""

import logging

from config import RETRIEVER_MODE
from retrievers.base import BaseAppRetriever
from retrievers.dense import DenseAppRetriever
from retrievers.hybrid import HybridAppRetriever
from retrievers.sparse import SparseAppRetriever

logger = logging.getLogger(__name__)


def get_active_retriever() -> BaseAppRetriever:
    """Return active retriever instance based on RETRIEVER_MODE configuration."""
    mode = (RETRIEVER_MODE or "hybrid").lower()
    if mode == "dense":
        return DenseAppRetriever()
    elif mode == "sparse":
        return SparseAppRetriever()
    elif mode == "hybrid":
        return HybridAppRetriever()
    else:
        logger.warning("Unknown RETRIEVER_MODE '%s', defaulting to hybrid mode", mode)
        return HybridAppRetriever()

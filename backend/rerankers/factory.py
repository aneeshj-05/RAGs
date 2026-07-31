"""Factory that returns a reranker instance (or None) based on configuration."""

import logging
from typing import Optional

import config
from rerankers.base import BaseReranker

logger = logging.getLogger(__name__)

_reranker_instance: Optional[BaseReranker] = None


def get_reranker() -> Optional[BaseReranker]:
    """Return the configured reranker, or None if reranking is disabled.

    The instance is a module-level singleton – the cross-encoder model is
    loaded once at startup and reused for every request.

    Returns:
        A ``BaseReranker`` if ``RERANKER_ENABLED=true``, otherwise ``None``.
    """
    global _reranker_instance

    if not config.RERANKER_ENABLED:
        logger.info("[RerankerFactory] Reranking is disabled (RERANKER_ENABLED=false).")
        return None

    if _reranker_instance is None:
        model_name = config.RERANKER_MODEL
        logger.info("[RerankerFactory] Initialising reranker: %s", model_name)
        # Import lazily so the heavy sentence-transformers dependency is only
        # loaded when reranking is actually enabled.
        from rerankers.bge import BGEReranker  # noqa: PLC0415

        _reranker_instance = BGEReranker(model_name)
        logger.info("[RerankerFactory] Reranker ready: %s", model_name)

    return _reranker_instance

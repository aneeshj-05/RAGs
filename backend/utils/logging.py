"""Logging setup."""

import logging

from config import LOG_LEVEL


def configure_logging() -> None:
    """Configure application logging once at startup."""
    logging.basicConfig(
        level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )

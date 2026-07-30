"""Chroma vector store setup and write operations."""

import logging
from typing import List

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

from config import CHROMA_COLLECTION_NAME, CHROMA_DIR, EMBEDDING_MODEL
from utils.exceptions import VectorStoreError

logger = logging.getLogger(__name__)


def get_embeddings() -> HuggingFaceEmbeddings:
    """Create the configured embedding model."""
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)


embeddings = get_embeddings()

vector_store = Chroma(
    collection_name=CHROMA_COLLECTION_NAME,
    persist_directory=CHROMA_DIR,
    embedding_function=embeddings,
)


def add_documents(documents: List[Document]) -> None:
    """Persist document chunks in Chroma."""
    if not documents:
        logger.warning("No documents provided to vector store")
        return

    try:
        vector_store.add_documents(documents)
        logger.info("Added %s chunks to Chroma", len(documents))
    except Exception as exc:
        logger.exception("Failed to add chunks to Chroma")
        raise VectorStoreError("Failed to store document embeddings.") from exc


def clear_collection() -> None:
    """Clear all existing document chunks from the Chroma collection."""
    try:
        existing = vector_store.get()
        if existing and "ids" in existing and existing["ids"]:
            vector_store.delete(ids=existing["ids"])
            logger.info("Cleared %d existing chunks from Chroma", len(existing["ids"]))
    except Exception as exc:
        logger.exception("Failed to clear Chroma collection")
        raise VectorStoreError("Failed to clear vector store.") from exc


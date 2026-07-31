"""Application configuration for the DocIntel backend."""

import os
from typing import Dict, List

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.2"))
GEMINI_MAX_TOKENS = int(os.getenv("GEMINI_MAX_TOKENS", "2048"))
GEMINI_MAX_RETRIES = int(os.getenv("GEMINI_MAX_RETRIES", "4"))

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
CHROMA_DIR = os.getenv("CHROMA_DIR", "chroma_db")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "langchain")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "800"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))
CHUNK_SEPARATORS: List[str] = ["\n\n", "\n", ". ", " ", ""]

RETRIEVER_SEARCH_TYPE = os.getenv("RETRIEVER_SEARCH_TYPE", "mmr")
RETRIEVER_TOP_K = int(os.getenv("RETRIEVER_TOP_K", "8"))
RETRIEVER_FETCH_K = int(os.getenv("RETRIEVER_FETCH_K", "20"))
RETRIEVER_SCORE_THRESHOLD = float(os.getenv("RETRIEVER_SCORE_THRESHOLD", "0.0"))

RETRIEVER_MODE = os.getenv("RETRIEVER_MODE", "hybrid")  # "dense" | "sparse" | "hybrid"
DENSE_WEIGHT = float(os.getenv("DENSE_WEIGHT", "0.5"))
SPARSE_WEIGHT = float(os.getenv("SPARSE_WEIGHT", "0.5"))
TOP_K_DENSE = int(os.getenv("TOP_K_DENSE", "20"))
TOP_K_SPARSE = int(os.getenv("TOP_K_SPARSE", "20"))

RERANKER_ENABLED = os.getenv("RERANKER_ENABLED", "true").lower() == "true"
RERANKER_MODEL = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-base")
TOP_K_CANDIDATES = int(os.getenv("TOP_K_CANDIDATES", "20"))
TOP_K_FINAL = int(os.getenv("TOP_K_FINAL", "5"))


RETRIEVER_SEARCH_KWARGS: Dict[str, int | float] = {
    "k": RETRIEVER_TOP_K,
    "fetch_k": RETRIEVER_FETCH_K,
}

if RETRIEVER_SEARCH_TYPE == "similarity_score_threshold":
    RETRIEVER_SEARCH_KWARGS["score_threshold"] = RETRIEVER_SCORE_THRESHOLD


LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

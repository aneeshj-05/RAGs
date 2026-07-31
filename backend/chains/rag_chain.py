"""Reusable LangChain RAG chain."""

import logging
import time
from contextvars import ContextVar
from typing import List

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

import config
from llm.gemini import get_gemini_llm
from prompts.rag_prompt import RAG_PROMPT
from rerankers.factory import get_reranker
from retrievers.retriever import retrieve_with_scores
from utils.exceptions import EmptyRetrievalError, GeminiGenerationError, RetrievalError

logger = logging.getLogger(__name__)
_last_documents_var: ContextVar[List[Document]] = ContextVar(
    "last_documents", default=[]
)
_last_confidence_var: ContextVar[float] = ContextVar(
    "last_confidence", default=0.0
)


def format_document(document: Document) -> str:
    """Format a retrieved document with useful citation metadata."""
    metadata = document.metadata or {}
    filename = metadata.get("filename") or metadata.get("source", "Unknown document")
    page_number = metadata.get("page_number", "unknown")
    chunk_id = metadata.get("chunk_id", metadata.get("chunk", "unknown"))
    citation = f"Source: {filename}, page: {page_number}, chunk: {chunk_id}"
    return f"{citation}\n{document.page_content}"


def format_documents(documents: List[Document]) -> str:
    """Format retrieved documents as grounded prompt context."""
    return "\n\n".join(format_document(document) for document in documents)


class RAGChain:
    """Thin application wrapper around a LangChain RAG pipeline.

    Pipeline:
        Question
          ↓
        Retriever  (Dense | Sparse | Hybrid – configured via RETRIEVER_MODE)
          ↓
        Cross-Encoder Reranker  (skipped when RERANKER_ENABLED=false)
          ↓
        Prompt Builder
          ↓
        Gemini LLM
    """

    def __init__(self) -> None:
        self._last_documents: List[Document] = []
        self._last_confidence: float = 0.0
        self._chain = (
            {
                "context": RunnableLambda(self._retrieve_rerank_and_format),
                "question": RunnablePassthrough(),
            }
            | RAG_PROMPT
            | get_gemini_llm()
            | StrOutputParser()
        )

    # ── Internal pipeline stages ──────────────────────────────────────────────

    def _retrieve_rerank_and_format(self, question: str) -> str:
        """Run retrieval → (optional) reranking → document formatting."""
        # ── Stage 1: Retrieve candidate documents ─────────────────────────────
        try:
            documents, confidence = retrieve_with_scores(question)
        except Exception as exc:
            logger.exception("Retrieval failed")
            raise RetrievalError("Failed to retrieve relevant document chunks.") from exc

        logger.info(
            "[RAGChain] Retriever returned %d candidate document(s) (confidence=%.4f)",
            len(documents),
            confidence,
        )

        if not documents:
            raise EmptyRetrievalError("No relevant document chunks were found.")

        # ── Stage 2: Rerank (independent pipeline stage) ─────────────────────
        reranker = get_reranker()
        if reranker is not None:
            logger.info(
                "[RAGChain] Reranking %d candidates → top %d",
                len(documents),
                config.TOP_K_FINAL,
            )
            documents = reranker.rerank(
                query=question,
                documents=documents,
                top_n=config.TOP_K_FINAL,
            )
            logger.info(
                "[RAGChain] Reranking complete – %d document(s) passed to LLM",
                len(documents),
            )
        else:
            logger.info(
                "[RAGChain] Reranking disabled – passing all %d document(s) to LLM",
                len(documents),
            )

        # ── Stage 3: Store results for inspection endpoints ───────────────────
        self._last_documents = documents
        self._last_confidence = confidence
        _last_documents_var.set(documents)
        _last_confidence_var.set(confidence)

        return format_documents(documents)

    # ── Public interface ──────────────────────────────────────────────────────

    def invoke(self, question: str) -> str:
        """Run retrieval, reranking, prompt construction, Gemini, and parsing."""
        start = time.perf_counter()
        try:
            answer = self._chain.invoke(question)
        except EmptyRetrievalError:
            raise
        except RetrievalError:
            raise
        except Exception as exc:
            logger.exception("Gemini generation failed")
            raise GeminiGenerationError("Failed to generate an answer.") from exc

        latency_ms = (time.perf_counter() - start) * 1000
        logger.info("[RAGChain] Total answer latency: %.2f ms", latency_ms)
        return answer

    def get_last_documents(self) -> List[Document]:
        """Return documents passed to the LLM during the most recent invocation."""
        return self._last_documents or _last_documents_var.get()

    def get_last_confidence(self) -> float:
        """Return confidence score calculated during the most recent invocation."""
        return self._last_confidence if self._last_confidence > 0 else _last_confidence_var.get()


rag_chain = RAGChain()

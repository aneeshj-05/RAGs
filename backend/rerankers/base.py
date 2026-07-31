"""Abstract base class for all rerankers."""

from abc import ABC, abstractmethod
from typing import List

from langchain_core.documents import Document


class BaseReranker(ABC):
    """Reranker interface.

    A reranker is intentionally retrieval-agnostic: it receives a plain
    ``List[Document]`` (regardless of whether those came from a Dense, Sparse,
    or Hybrid retriever) and returns a shorter, reordered list.
    """

    @abstractmethod
    def rerank(self, query: str, documents: List[Document], top_n: int) -> List[Document]:
        """Score and reorder *documents* w.r.t. *query*, returning the top-n.

        Args:
            query: The user's question.
            documents: Candidate documents from any retriever.
            top_n: Number of documents to return after reranking.

        Returns:
            Reranked subset of *documents*, highest-relevance first.
        """

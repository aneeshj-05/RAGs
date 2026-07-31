"""Base retriever interface."""

from abc import ABC, abstractmethod
from typing import List

from langchain_core.documents import Document


class BaseAppRetriever(ABC):
    """Abstract base class for application retrievers."""

    @abstractmethod
    def retrieve_with_scores(self, query: str) -> tuple[List[Document], float]:
        """Retrieve relevant documents and calculate dense confidence score."""
        pass

"""Application-specific exceptions."""


class DocIntelError(Exception):
    """Base exception for expected DocIntel backend failures."""


class UploadError(DocIntelError):
    """Raised when an uploaded file cannot be saved or processed."""


class InvalidPDFError(DocIntelError):
    """Raised when a PDF cannot be read or contains no usable text."""


class RetrievalError(DocIntelError):
    """Raised when document retrieval fails."""


class EmptyRetrievalError(DocIntelError):
    """Raised when no relevant context is found."""


class GeminiGenerationError(DocIntelError):
    """Raised when Gemini generation fails."""


class VectorStoreError(DocIntelError):
    """Raised when vector store operations fail."""

"""PDF ingestion and chunk generation."""

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List

import fitz
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import CHUNK_OVERLAP, CHUNK_SEPARATORS, CHUNK_SIZE
from utils.exceptions import InvalidPDFError

logger = logging.getLogger(__name__)


def get_text_splitter() -> RecursiveCharacterTextSplitter:
    """Create the configured text splitter."""
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=CHUNK_SEPARATORS,
    )


def extract_page_texts(pdf_path: str) -> List[tuple[int, str]]:
    """Extract text from each page of a PDF using PyMuPDF."""
    try:
        with fitz.open(pdf_path) as pdf:
            pages = [
                (page_number + 1, page.get_text())
                for page_number, page in enumerate(pdf)
            ]
    except Exception as exc:
        raise InvalidPDFError("Invalid or unreadable PDF file.") from exc

    if not pages or not any(text.strip() for _, text in pages):
        raise InvalidPDFError("PDF does not contain extractable text.")

    return pages


def process_pdf(pdf_path: str) -> List[Document]:
    """Extract and split a PDF into LangChain documents with metadata."""
    filename = Path(pdf_path).name
    uploaded_at = datetime.now(timezone.utc).isoformat()
    splitter = get_text_splitter()
    documents: List[Document] = []
    chunk_id = 0

    for page_number, page_text in extract_page_texts(pdf_path):
        page_chunks = splitter.split_text(page_text)
        for chunk in page_chunks:
            if not chunk.strip():
                continue
            documents.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "filename": filename,
                        "page_number": page_number,
                        "chunk_id": chunk_id,
                        "chunk": chunk_id,
                        "source": filename,
                        "upload_timestamp": uploaded_at,
                    },
                )
            )
            chunk_id += 1

    logger.info(
        "Generated %s chunks for %s using chunk_size=%s overlap=%s",
        len(documents),
        filename,
        CHUNK_SIZE,
        CHUNK_OVERLAP,
    )
    return documents

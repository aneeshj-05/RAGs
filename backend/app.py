"""FastAPI entrypoint for DocIntel."""

import logging
import os
import shutil
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from chains.rag_chain import rag_chain
from config import UPLOAD_DIR
from services.ingest import process_pdf
from utils.exceptions import (
    DocIntelError,
    EmptyRetrievalError,
    GeminiGenerationError,
    InvalidPDFError,
    UploadError,
    VectorStoreError,
)
from utils.logging import configure_logging
from vectorstore.bm25 import build_bm25_retriever, clear_bm25_retriever
from vectorstore.chroma import add_documents, clear_collection

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(DocIntelError)
async def docintel_exception_handler(_, exc: DocIntelError):
    """Convert expected backend errors into stable API errors."""
    logger.exception("Handled application error: %s", exc)

    status_code = 500
    detail = str(exc)
    if isinstance(exc, (InvalidPDFError, UploadError)):
        status_code = 400
    elif isinstance(exc, GeminiGenerationError):
        status_code = 502
        detail = f"Gemini API error: {exc}"
    elif isinstance(exc, VectorStoreError):
        status_code = 500

    return JSONResponse(status_code=status_code, content={"detail": detail})


@app.get("/")
def home():
    """Health check endpoint."""
    return {"message": "DocIntel AI API Running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload, parse, chunk, embed, and store a PDF."""
    upload_dir = Path(UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    path = upload_dir / os.path.basename(file.filename or "uploaded.pdf")

    try:
        with path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        logger.exception("Failed to save upload: %s", file.filename)
        raise UploadError("Failed to save uploaded file.") from exc

    try:
        clear_collection()
        clear_bm25_retriever()
        documents = process_pdf(str(path))
        add_documents(documents)
        build_bm25_retriever(documents)
    except DocIntelError:
        raise
    except Exception as exc:
        logger.exception("Failed to process upload: %s", file.filename)
        raise UploadError("Failed to process uploaded PDF.") from exc


    logger.info("Uploaded %s with %s chunks", path.name, len(documents))
    return {
        "status": "success",
        "chunks": len(documents),
    }


@app.post("/ask")
async def ask(question: str):
    """Answer a question using the configured RAG chain."""
    try:
        answer = rag_chain.invoke(question)
        docs = rag_chain.get_last_documents()
        confidence = rag_chain.get_last_confidence()
    except EmptyRetrievalError:
        logger.info("No retrieval results for question: %s", question)
        answer = "The uploaded documents do not contain this information."
        docs = []
        confidence = 0.0
    except DocIntelError:
        raise
    except Exception as exc:
        logger.exception("Unexpected question-answering failure")
        raise GeminiGenerationError("Unexpected question-answering failure.") from exc

    return {
        "answer": answer,
        "sources": [doc.metadata for doc in docs],
        "confidence": confidence,
    }


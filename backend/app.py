
from fastapi import FastAPI,UploadFile,File,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.genai import errors
import shutil
import os

from config import UPLOAD_DIR
from ingest import process_pdf
from rag import add_chunks,retrieve
from llm import generate_answer

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def home():
    return {"message":"DocIntel AI API Running"}

@app.post("/upload")
async def upload_pdf(file:UploadFile=File(...)):
    path=os.path.join(UPLOAD_DIR,file.filename)

    with open(path,"wb") as buffer:
        shutil.copyfileobj(file.file,buffer)

    chunks=process_pdf(path)
    add_chunks(chunks)

    return {
        "status":"success",
        "chunks":len(chunks)
    }

@app.post("/ask")
async def ask(question:str):
    docs=retrieve(question)

    try:
        answer=generate_answer(question,docs)
    except errors.APIError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {e}",
        ) from e

    return {
        "answer":answer,
        "sources":[
            doc.metadata for doc in docs
        ]
    }
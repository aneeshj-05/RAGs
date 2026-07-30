from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")
GEMINI_MODEL=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

UPLOAD_DIR="uploads"
CHROMA_DIR="chroma_db"

EMBEDDING_MODEL="BAAI/bge-small-en-v1.5"
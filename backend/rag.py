from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

from config import EMBEDDING_MODEL,CHROMA_DIR

embeddings=HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL
)

vector_store=Chroma(
    persist_directory=CHROMA_DIR,
    embedding_function=embeddings
)

def add_chunks(chunks, filename="Uploaded Document"):
    docs=[
        Document(
            page_content=chunk,
            metadata={"chunk":i, "source": filename}
        )
        for i,chunk in enumerate(chunks)
    ]
    vector_store.add_documents(docs)

def retrieve(query,k=4):
    return vector_store.similarity_search(query,k=k)
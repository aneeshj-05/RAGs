# 🚀 DocIntel AI

> **Production-Grade Retrieval-Augmented Generation (RAG) System with Hybrid Retrieval & Cross-Encoder Reranking**

DocIntel AI is a modular document intelligence platform that enables users to upload PDF documents and interact with them through natural language. Unlike conventional PDF chatbots that rely solely on vector similarity search, DocIntel AI employs a **two-stage retrieval pipeline** combining **Dense Retrieval**, **BM25 Sparse Retrieval**, **Reciprocal Rank Fusion (RRF)**, and **Cross-Encoder Reranking** to significantly improve retrieval precision before generating responses using Google's Gemini.

---

## 📌 Features

- 📄 Upload and index PDF documents
- 💬 Natural language question answering over uploaded documents
- 🧠 Hybrid Retrieval
  - Dense Semantic Search (ChromaDB)
  - Sparse Keyword Search (BM25)
  - LangChain EnsembleRetriever (Reciprocal Rank Fusion)
- 🎯 Cross-Encoder Reranking using **BAAI/bge-reranker-base**
- ⚡ Modular LangChain pipeline
- 📊 Retrieval confidence and source attribution
- 📝 Metadata-aware document chunking
- ⚙️ Fully configurable retrieval pipeline
- 📈 Structured logging for retrieval, reranking, and latency analysis

---

# 🏗 System Architecture

```
                          PDF Upload
                               │
                               ▼
                     PyMuPDF Document Loader
                               │
                               ▼
             RecursiveCharacterTextSplitter
                               │
                               ▼
                   LangChain Document Objects
                     │                     │
                     ▼                     ▼
              Dense Embeddings          BM25 Index
               (HuggingFace)           (Sparse Search)
                     │                     │
                     └─────────┬───────────┘
                               ▼
                 EnsembleRetriever (RRF)
                               │
                     Top-K Candidate Chunks
                               ▼
          Cross Encoder Reranker (BAAI/bge-reranker-base)
                               │
                      Top-N Relevant Chunks
                               ▼
                    Prompt Construction Layer
                               ▼
                    Google Gemini 2.5 Flash
                               ▼
                      Final Grounded Response
```

---

# 🧠 Why RAG?

Uploading an entire document to an LLM for every query is inefficient, expensive, and doesn't scale as document sizes increase.

Instead, DocIntel AI:

- Indexes documents once
- Retrieves only the most relevant sections
- Grounds every answer in retrieved context
- Reduces hallucinations
- Lowers token usage
- Improves response quality and scalability

---

# 🔍 Retrieval Pipeline

## 1️⃣ Dense Retrieval

Documents are embedded using **BAAI/bge-small-en-v1.5** and stored in **ChromaDB**.

Dense retrieval captures semantic similarity between user queries and document chunks.

Example:

> "Explain authentication"

can retrieve content mentioning

- Login
- JWT
- Authorization

even if the exact word "authentication" isn't present.

---

## 2️⃣ Sparse Retrieval (BM25)

Dense embeddings often struggle with:

- API routes
- Variable names
- Error codes
- Acronyms
- Configuration keys

BM25 complements semantic retrieval by performing lexical keyword matching.

Example:

```
JWT_SECRET
```

or

```
POST /dashboard/stats
```

are retrieved far more accurately using BM25.

---

## 3️⃣ Hybrid Retrieval

DocIntel AI combines Dense Retrieval and BM25 using LangChain's built-in **EnsembleRetriever**, which internally performs **Reciprocal Rank Fusion (RRF)**.

This provides the advantages of both retrieval methods:

- Semantic understanding
- Exact keyword matching

without manually implementing fusion algorithms.

---

## 4️⃣ Cross-Encoder Reranking

Hybrid retrieval prioritizes **high recall**, meaning it retrieves a broad set of potentially relevant chunks.

A Cross Encoder then performs pairwise relevance scoring:

```
(Query, Chunk)
        ↓
Cross Encoder
        ↓
Relevance Score
```

The highest scoring chunks are forwarded to Gemini.

This dramatically reduces noisy context and improves answer precision.

Current reranker:

```
BAAI/bge-reranker-base
```

---

# 🛠 Tech Stack

### Backend

- FastAPI
- Python

### LLM

- Google Gemini 2.5 Flash

### LangChain

- LangChain Core
- ChatPromptTemplate
- EnsembleRetriever

### Vector Database

- ChromaDB

### Retrieval

- Dense Retrieval
- BM25
- Reciprocal Rank Fusion (RRF)

### Embeddings

- BAAI/bge-small-en-v1.5

### Reranker

- BAAI/bge-reranker-base

### PDF Processing

- PyMuPDF

---

# 📂 Project Structure

```
backend/

├── app.py
├── config.py
│
├── chains/
│   └── rag_chain.py
│
├── llm/
│   └── gemini.py
│
├── prompts/
│   └── rag_prompt.py
│
├── retrievers/
│   ├── dense.py
│   ├── sparse.py
│   ├── hybrid.py
│   ├── factory.py
│   └── retriever.py
│
├── rerankers/
│   ├── base.py
│   ├── bge.py
│   └── factory.py
│
├── services/
│   └── ingest.py
│
├── vectorstore/
│   ├── chroma.py
│   └── bm25.py
│
└── utils/
    ├── logging.py
    └── exceptions.py
```

---

# ⚙ Configuration

Everything is configurable through `config.py`.

```python
RETRIEVER_MODE="hybrid"

TOP_K_DENSE=20

TOP_K_SPARSE=20

TOP_K_CANDIDATES=20

TOP_K_FINAL=5

RERANKER_ENABLED=True

RERANKER_MODEL="BAAI/bge-reranker-base"
```

Switch between:

- Dense Retrieval
- Sparse Retrieval
- Hybrid Retrieval

without changing application code.

---

# 🚀 Running Locally

```bash
git clone <repo>

cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements

uvicorn app:app --reload
```

---

# 📡 API Endpoints

## Upload Document

```
POST /upload
```

Uploads and indexes a PDF document.

---

## Ask Questions

```
POST /ask
```

Returns:

- Generated answer
- Source chunks
- Confidence score

---

# 📈 Logging & Observability

Every query logs:

- Dense Retrieval Latency
- BM25 Retrieval Latency
- Hybrid Retrieval Latency
- Candidate Chunk IDs
- Cross Encoder Scores
- Final Selected Chunks
- Reranking Latency

making the retrieval pipeline fully traceable and debuggable.

---

# 🎯 Design Decisions

### Why Hybrid Retrieval?

Dense retrieval excels at semantic similarity but struggles with exact keywords.

BM25 excels at exact matches but lacks semantic understanding.

Combining both provides significantly better retrieval quality.

---

### Why Cross Encoder?

Vector similarity provides approximate relevance.

Cross Encoders jointly process:

```
Question

+

Document Chunk
```

to produce significantly more accurate relevance scores before generation.

---

### Why ChromaDB?

- Persistent Vector Store
- Native LangChain Integration
- Efficient Similarity Search
- Lightweight Deployment

---

# 🚧 Current Limitations

- Single active document per session
- CPU-based reranking increases latency
- Evaluation framework (RAGAS/DeepEval) not yet integrated
- Multi-document retrieval support planned

---

# 🔮 Future Roadmap

- Multi-document Retrieval
- LangSmith Observability
- Automated Evaluation (RAGAS / DeepEval)
- Agentic RAG
- Context Compression
- Query Rewriting
- Multimodal RAG
- OCR Integration
- Vision Language Models (VLMs)

---



# 👨‍💻 Author

**Aneesh Jantikar**

Computer Science Undergraduate | AI & Machine Learning Enthusiast

- GitHub: https://github.com/aneeshj-05
- LinkedIn: www.linkedin.com/in/aneeshjantikar

---

⭐ If you found this project interesting, consider giving it a star!

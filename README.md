# StudyMate 🧠

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://reactjs.org/)

**StudyMate** is an AI-powered study assistant and document analysis platform that helps you seamlessly learn from your PDF notes using a highly optimized **Retrieval-Augmented Generation (RAG)** architecture. 

By avoiding heavy framework abstractions like LangChain, StudyMate relies on a custom, lightweight ingestion pipeline to process documents, generating high-quality vector embeddings to provide accurate, context-aware answers to your questions in real-time.

---

## ✨ Features

- **📄 Intelligent PDF Processing** — Upload your study notes and let the custom chunking engine process them instantly.
- **💬 Real-Time Streaming Chat** — Ask questions about your notes and get grounded answers streamed back in real-time, complete with markdown rendering and code syntax highlighting.
- **📚 Global Knowledge vs. Local Context** — Query a specific document, or ask the AI to retrieve context from your entire knowledge base.
- **🔐 Secure Authentication** — JWT-based authentication system built with `fastapi-users` to keep your documents and chat history private.
- **🎨 Modern UI/UX** — A sleek, responsive, and accessible interface built with React, Tailwind CSS v4, and Radix UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Radix UI, React Markdown |
| **Backend** | FastAPI (Python), SQLAlchemy, async HTTP clients |
| **Database** | SQLite (Development) / PostgreSQL (Production ready) |
| **Vector DB** | ChromaDB (Local vector storage and semantic search) |
| **Embeddings** | HuggingFace (`BAAI/bge-base-en-v1.5`) |
| **LLMs** | Ollama (Local) / OpenAI / Gemini (API) |
| **Auth** | JWT via `fastapi-users` |

---

## 🧠 How It Works (The RAG Pipeline)

Unlike typical RAG demos that rely on heavy wrappers, StudyMate implements the core concepts natively for maximum control and performance:

1. **Ingestion:** PDFs are parsed using `pypdf`, and text is recursively split into overlapping chunks using a custom, lightweight Python implementation of the `RecursiveCharacterTextSplitter`.
2. **Vectorization:** Text chunks are embedded via the official HuggingFace Hub SDK using `bge-base-en-v1.5`, a state-of-the-art open-source embedding model.
3. **Retrieval & Generation:** User queries are embedded and searched against ChromaDB. The top context chunks are injected into the system prompt, and the response is streamed back to the client via Server-Sent Events (SSE) using the official `openai` or `ollama` SDKs.

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Ollama](https://ollama.ai/) installed locally (if running local models)
- [UV](https://docs.astral.sh/uv/) (optional, for running Python outside Docker)

### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/studymate.git
cd studymate
cp .env.example .env
```
*(Ensure you fill in your database URLs, JWT secret, and any necessary API keys in the `.env` file.)*

### 2. Pull Local Models (Optional)

If you are using Ollama for local generation:
```bash
ollama pull llama3
```

### 3. Start the Application

The easiest way to run the entire stack (Frontend + Backend + DB) is via Docker Compose:

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

```
studymate/
├── server/          # FastAPI backend
│   ├── app/
│   │   ├── core/    # Config, auth, dependencies
│   │   ├── models/  # SQLAlchemy ORM models
│   │   ├── schemas/ # Pydantic validation schemas
│   │   ├── routers/ # API endpoints (auth, chat, documents)
│   │   └── services/# Custom RAG logic, chunking, and LLM integrations
│   └── alembic/     # Database migrations
├── client/          # React + Vite frontend
│   └── src/         # UI components, pages, API clients
└── docker-compose.yml
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

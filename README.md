# StudyMate

AI-powered study assistant that helps you learn from your PDF notes using RAG (Retrieval-Augmented Generation).

## Features

- **PDF Upload** — Upload your study notes and let the AI process them
- **Smart Chat** — Ask questions about your notes and get grounded answers
- **Flashcards** — Auto-generate Q&A flashcards from your documents
- **Summaries** — Get concise summaries of uploaded material

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Database | PostgreSQL + pgvector (Aiven) |
| AI (Dev) | Ollama (local) |
| AI (Prod) | Gemini API |
| Auth | JWT via fastapi-users |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Ollama](https://ollama.ai/) installed locally
- [Aiven](https://aiven.io/) PostgreSQL instance (free tier)
- [UV](https://docs.astral.sh/uv/) (for running Python outside Docker)

### 1. Clone and configure

```bash
git clone <repo-url>
cd studymate
cp .env.example .env
# fill in your Aiven DB URL, JWT secret, etc.
```

### 2. Pull Ollama models

```bash
ollama pull qwen3:4b
ollama pull nomic-embed-text
```

### 3. Start the app

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend (Swagger): http://localhost:8000/docs

## Project Structure

```
studymate/
├── server/          # FastAPI backend
│   ├── app/
│   │   ├── core/    # Config, database, auth
│   │   ├── models/  # SQLAlchemy models
│   │   ├── schemas/ # Pydantic schemas
│   │   ├── routers/ # API endpoints
│   │   └── services/# Business logic + AI providers
│   └── alembic/     # Database migrations
├── client/          # React + Vite frontend
│   └── src/
└── scripts/         # Utility scripts
```

## License

MIT

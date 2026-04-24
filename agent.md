# 🤖 AI Agent Memory — Onboarding Assistant Backend

## 📌 Project Overview

AI-powered employee onboarding assistant backend using RAG (Retrieval-Augmented Generation) to answer queries from company documents and generate structured 30-day onboarding plans. Supports persistent multi-turn conversation per user.

---

## ⚙️ Tech Stack

| Component          | Technology              |
|--------------------|-------------------------|
| API Framework      | FastAPI                 |
| Text Splitting     | LangChain               |
| Vector DB          | ChromaDB (persistent)   |
| Embeddings         | sentence-transformers (all-MiniLM-L6-v2) |
| LLM                | Gemini API (gemini-flash-latest) via `google-genai` SDK |
| Frontend           | React + Vite + TailwindCSS (onboardai/) |
| PDF Parsing        | pypdf                   |
| DOCX Parsing       | python-docx             |
| Server             | Uvicorn                 |

---

## 🧱 Architecture

```
Client → FastAPI Routes → Services → ChromaDB / Gemini API
```

- **Routes** handle HTTP, validation, error responses
- **Services** contain all business logic (no logic in routes/main)
- **ChromaDB** stores document embeddings for semantic retrieval
- **Gemini API** generates responses and onboarding plans
- **Conversation memory** is in-memory per `user_id` (simple persistence)

---

## 📂 Folder Structure

```
backend/
├── main.py                  # FastAPI app entry point
├── core/
│   └── config.py            # Pydantic Settings (env vars)
├── models/
│   └── schemas.py           # Request/Response Pydantic models
├── db/
│   └── chroma_client.py     # Singleton ChromaDB client
├── services/
│   ├── document_loader.py   # PDF/DOCX extraction + chunking
│   ├── embedding_service.py # sentence-transformers wrapper
│   ├── gemini_service.py    # Gemini API wrapper
│   ├── rag_service.py       # RAG pipeline + conversation history
│   └── plan_generator.py    # 30-day plan generation
├── routes/
│   ├── upload.py            # POST /upload
│   ├── chat.py              # POST /chat, DELETE /chat/history/{user_id}
│   └── plan.py              # POST /generate-plan
```

---

## 🔌 API Endpoints

| Method | Path                        | Description                     |
|--------|-----------------------------|---------------------------------|
| POST   | `/upload`                   | Upload & process PDF/DOCX       |
| POST   | `/chat`                     | RAG Q&A with conversation memory|
| DELETE | `/chat/history/{user_id}`   | Clear user conversation history |
| POST   | `/generate-plan`            | Generate 30-day onboarding plan |
| GET    | `/health`                   | Health check                    |

---

## 🧠 RAG Pipeline

1. Document uploaded → text extracted (pypdf / python-docx)
2. Text split into ~800-char chunks with 200-char overlap
3. Chunks embedded via `all-MiniLM-L6-v2`
4. Chunks + embeddings stored in ChromaDB
5. On query: question embedded → top-5 chunks retrieved → context + history sent to Gemini
6. Gemini response returned with source citations

---

## 💬 Conversation Persistence

- In-memory `dict[user_id → list[messages]]`
- Each message: `{"role": "user"|"model", "parts": str}`
- Max 10 turns retained per user (configurable in `config.py`)
- History sent to Gemini using `start_chat()` for multi-turn context
- `DELETE /chat/history/{user_id}` to reset

---

## ⚡ Current Status

- [x] Project structure created
- [x] Configuration system (env vars, .env)
- [x] Document upload & processing pipeline
- [x] Embedding service
- [x] ChromaDB integration
- [x] RAG retrieval + generation
- [x] Gemini API integration (new `google-genai` SDK)
- [x] Conversational chat with history
- [x] 30-day plan generation
- [x] All API endpoints implemented
- [x] agent.md initialized
- [x] Frontend integrated (Chat, Plan, Dashboard → backend API)
- [x] Vite proxy configured (/api → localhost:8000)

---

## 🔐 Environment Variables

| Variable        | Required | Description          |
|-----------------|----------|----------------------|
| `GEMINI_API_KEY` | Yes      | Google Gemini API key |

---

## 🧩 Future Improvements

- Redis/DB-backed conversation persistence
- Role-based document retrieval
- Streaming responses
- Authentication & authorization
- File management (list/delete uploaded docs)
- Analytics dashboard

---

## 📌 Notes

- This is an MVP backend — focus on correctness, not scale
- Conversation history is lost on server restart (in-memory)
- `.env.example` provided as template

# OnboardAI - AI-Powered Employee Onboarding Assistant

🚀 **Note: This project was built in just 3 hours as part of an intensive AI Bootcamp!**

## 📌 Project Overview

OnboardAI is an intelligent employee onboarding assistant designed to streamline the integration of new hires into a company. Utilizing RAG (Retrieval-Augmented Generation), the system can answer queries based on uploaded company documents and generate structured, personalized 30-day onboarding plans.

The application features a robust backend powered by FastAPI and Gemini, along with a modern, responsive frontend built with React, Vite, and TailwindCSS. It supports persistent multi-turn conversations per user, making the onboarding experience interactive and tailored.

---

## 🛠️ Tech Stack

### Backend
- **API Framework:** FastAPI
- **LLM:** Google Gemini API (gemini-flash-latest) via `google-genai` SDK
- **Vector Database:** ChromaDB (persistent local storage)
- **Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Document Processing:** LangChain, `pypdf`, `python-docx`
- **Server:** Uvicorn

### Frontend
- **Framework:** React + Vite
- **Styling:** TailwindCSS

---

## ⚙️ How It Works (Architecture & RAG Pipeline)

The system is built on a standard RAG architecture:

1. **Document Upload:** HR admins or managers upload company materials (PDF/DOCXs) via the frontend.
2. **Processing & Embedding:** The backend extracts text, chunks it (approx. 800-character chunks with 200-character overlap), and generates embeddings using the `all-MiniLM-L6-v2` model.
3. **Storage:** Chunks and their embeddings are stored persistently in a local ChromaDB instance.
4. **Interactive Chat:** When a user asks a question, the query is embedded, and the top 5 most relevant chunks are retrieved. The context, along with the user's conversational history (maintained in-memory), is sent to the Gemini API to generate an accurate, source-cited response.
5. **Plan Generation:** A dedicated endpoint utilizes the Gemini API to create structured 30-day onboarding plans based on provided user parameters and company context.

---

## 🔌 API Endpoints

The backend exposes the following RESTful endpoints:

| Method | Path | Description |
|--------|------|-------------|
| **POST** | `/upload` | Upload & process company documents (PDF/DOCX) into the vector store. |
| **POST** | `/chat` | Main RAG Q&A endpoint. Supports conversational memory per user. |
| **DELETE** | `/chat/history/{user_id}` | Clears the conversation history for a specific user. |
| **POST** | `/generate-plan` | Generates a structured 30-day onboarding plan. |
| **GET** | `/health` | Simple health check to verify backend status. |

*(Note: The frontend Vite development server is configured to proxy `/api` requests to the FastAPI backend running on `localhost:8000`.)*

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- A Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory.
2. Create a virtual environment and activate it: `python -m venv venv`
3. Install dependencies: `pip install -r ../requirements.txt`
4. Copy `.env.example` to `.env` (in the root directory) and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
5. Run the FastAPI server: 
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the `onboardai` directory.
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`

---

## 💡 Future Improvements
While this MVP was developed rapidly, potential future enhancements include:
- Redis/DB-backed persistent conversation memory (currently in-memory).
- Role-based document retrieval and access control.
- Streaming responses for the chat interface.
- Advanced analytics dashboard for HR teams.
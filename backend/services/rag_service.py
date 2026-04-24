"""RAG service — store chunks, retrieve context, generate answers."""

from collections import defaultdict

from backend.core.config import settings
from backend.db.chroma_client import get_or_create_collection
from backend.services.embedding_service import get_embeddings
from backend.services.gemini_service import generate_with_history
from backend.models.schemas import ChatResponse, SourceChunk

# ── In-memory conversation history (simple persistence per user) ────────
# Keyed by user_id → list of {"role": "user"|"model", "parts": [{"text": str}]}
_conversation_store: dict[str, list[dict]] = defaultdict(list)

SYSTEM_PROMPT = (
    "You are an AI HR onboarding assistant. "
    "Answer ONLY from the provided context. "
    "If the answer is not found in the context, say "
    "'I don't know based on the provided documents.' "
    "Be helpful, concise, and cite the source document names when possible."
)


def store_chunks(
    chunks: list[dict],
    embeddings: list[list[float]],
) -> int:
    """Upsert text chunks + embeddings into ChromaDB. Returns count stored."""
    collection = get_or_create_collection()
    ids = [c["metadata"]["chunk_id"] for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )
    return len(ids)


def query(question: str, user_id: str) -> ChatResponse:
    """Run the full RAG pipeline: embed → retrieve → build prompt → Gemini."""
    collection = get_or_create_collection()

    # 1. Embed the question
    q_embedding = get_embeddings([question])[0]

    # 2. Retrieve top-k chunks
    results = collection.query(
        query_embeddings=[q_embedding],
        n_results=settings.TOP_K,
        include=["documents", "metadatas"],
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    # 3. Build context block
    if not documents:
        return ChatResponse(
            answer="I don't know based on the provided documents.",
            sources=[],
        )

    context_parts: list[str] = []
    sources: list[SourceChunk] = []
    for doc_text, meta in zip(documents, metadatas):
        context_parts.append(f"[{meta.get('filename', 'unknown')}]: {doc_text}")
        sources.append(
            SourceChunk(
                text=doc_text[:300],
                filename=meta.get("filename", "unknown"),
                chunk_id=meta.get("chunk_id", ""),
            )
        )

    context_block = "\n\n".join(context_parts)

    # 4. Build the user message with context
    user_message = (
        f"{SYSTEM_PROMPT}\n\n"
        f"--- CONTEXT ---\n{context_block}\n--- END CONTEXT ---\n\n"
        f"Question: {question}"
    )

    # 5. Append to conversation history
    history = _conversation_store[user_id]
    history.append({"role": "user", "parts": [{"text": user_message}]})

    # Trim history to max turns (keep system-relevant recent turns)
    max_msgs = settings.MAX_HISTORY_TURNS * 2  # user + model per turn
    if len(history) > max_msgs:
        _conversation_store[user_id] = history[-max_msgs:]
        history = _conversation_store[user_id]

    # 6. Generate response with conversation history
    answer = generate_with_history(history, user_message)

    # 7. Store assistant reply in history
    history.append({"role": "model", "parts": [{"text": answer}]})

    return ChatResponse(answer=answer, sources=sources)


def clear_history(user_id: str) -> None:
    """Clear conversation history for a user."""
    _conversation_store.pop(user_id, None)


def get_chat_history(user_id: str) -> list[dict]:
    """Retrieve the conversation history for a user."""
    return _conversation_store.get(user_id, [])


def get_uploaded_documents() -> list[str]:
    """Get a list of unique filenames stored in ChromaDB."""
    collection = get_or_create_collection()
    results = collection.get(include=["metadatas"])
    metadatas = results.get("metadatas", [])
    
    unique_files = set()
    for meta in metadatas:
        if meta and "filename" in meta:
            unique_files.add(meta["filename"])
            
    return sorted(list(unique_files))

"""Chat route — POST /chat for RAG-based Q&A with conversation history."""

from fastapi import APIRouter, HTTPException

from backend.models.schemas import ChatRequest, ChatResponse
from backend.services.rag_service import query, clear_history, get_chat_history

router = APIRouter()

@router.get("/chat/history/{user_id}")
async def fetch_chat_history(user_id: str) -> dict:
    """Get conversation history for a specific user."""
    history = get_chat_history(user_id)
    return {"history": history}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Query company knowledge using RAG with persistent conversation context."""
    try:
        response = query(question=request.query, user_id=request.user_id)
        return response
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")


@router.delete("/chat/history/{user_id}")
async def delete_chat_history(user_id: str) -> dict:
    """Clear conversation history for a specific user."""
    clear_history(user_id)
    return {"message": f"Conversation history cleared for user '{user_id}'."}

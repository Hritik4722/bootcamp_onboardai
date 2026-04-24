"""Reusable Gemini API service module (new SDK)."""

from google import genai

from backend.core.config import settings

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    """Return a singleton Gemini client."""
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. "
                "Please set it in .env or as an environment variable."
            )
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def generate(prompt: str) -> str:
    """Send a prompt to Gemini and return the text response."""
    client = _get_client()
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return response.text


def generate_with_history(messages: list[dict], user_message: str) -> str:
    """Send a conversation (history + new message) to Gemini.

    Args:
        messages: List of {"role": "user"|"model", "parts": [{"text": "..."}]} dicts.
        user_message: The latest user message (already included at end of messages).

    Returns:
        The model's text response.
    """
    client = _get_client()
    chat = client.chats.create(
        model=settings.GEMINI_MODEL,
        history=messages[:-1],
    )
    response = chat.send_message(user_message)
    return response.text

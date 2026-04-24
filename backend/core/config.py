"""Application configuration loaded from environment variables."""

import os
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the onboarding assistant backend."""

    # ── Gemini ──────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"

    # ── ChromaDB ────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "chroma_data")
    CHROMA_COLLECTION: str = "onboarding_docs"

    # ── Chunking ────────────────────────────────────────────
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 200

    # ── RAG ─────────────────────────────────────────────────
    TOP_K: int = 5

    # ── Conversation history ────────────────────────────────
    MAX_HISTORY_TURNS: int = 10  # per user

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

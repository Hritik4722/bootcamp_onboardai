"""Embedding service wrapping sentence-transformers."""

from sentence_transformers import SentenceTransformer

# Load model once at module level (lazy singleton via function).
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Return embeddings for a list of text strings."""
    model = _get_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()

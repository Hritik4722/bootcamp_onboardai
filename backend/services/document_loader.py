"""Document text extraction and chunking service."""

import io
from typing import Any

from pypdf import PdfReader
from docx import Document as DocxDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.core.config import settings


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract all text from a DOCX file."""
    doc = DocxDocument(io.BytesIO(file_bytes))
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())


def extract_text(filename: str, file_bytes: bytes) -> str:
    """Route extraction based on file extension."""
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")


def chunk_text(text: str, filename: str) -> list[dict[str, Any]]:
    """Split text into overlapping chunks with metadata.

    Returns a list of dicts: {"text": ..., "metadata": {"filename": ..., "chunk_id": ...}}
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    raw_chunks = splitter.split_text(text)

    chunks: list[dict[str, Any]] = []
    for idx, chunk in enumerate(raw_chunks):
        chunks.append(
            {
                "text": chunk,
                "metadata": {
                    "filename": filename,
                    "chunk_id": f"{filename}_chunk_{idx}",
                },
            }
        )
    return chunks

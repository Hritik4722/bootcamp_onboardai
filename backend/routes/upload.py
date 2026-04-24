"""Upload route — POST /upload for PDF/DOCX documents."""

from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.models.schemas import UploadResponse
from backend.services.document_loader import extract_text, chunk_text
from backend.services.embedding_service import get_embeddings
from backend.services.rag_service import store_chunks, get_uploaded_documents

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc"}

@router.get("/documents")
async def list_documents() -> list[str]:
    """Return a list of all uniquely uploaded filenames."""
    try:
        return get_uploaded_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)) -> UploadResponse:
    """Upload a PDF or DOCX file, extract text, chunk, embed, and store in ChromaDB."""

    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file bytes
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract text
    try:
        text = extract_text(file.filename, file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text: {e}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted from the document.")

    # Chunk text
    chunks = chunk_text(text, file.filename)

    # Generate embeddings
    texts = [c["text"] for c in chunks]
    embeddings = get_embeddings(texts)

    # Store in ChromaDB
    count = store_chunks(chunks, embeddings)

    return UploadResponse(
        filename=file.filename,
        chunks_stored=count,
        message=f"Successfully processed and stored {count} chunks.",
    )

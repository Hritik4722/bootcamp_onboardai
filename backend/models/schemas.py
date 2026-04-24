"""Pydantic request / response schemas for all API endpoints."""

from pydantic import BaseModel, Field


# ── Upload ──────────────────────────────────────────────────
class UploadResponse(BaseModel):
    filename: str
    chunks_stored: int
    message: str


# ── Chat ────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User question")
    user_id: str = Field(..., min_length=1, description="Unique user identifier for conversation history")


class SourceChunk(BaseModel):
    text: str
    filename: str
    chunk_id: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk] = []


# ── Plan ────────────────────────────────────────────────────
class PlanRequest(BaseModel):
    role: str = Field(..., min_length=1, description="Job role, e.g. 'Software Engineer'")
    experience: str = Field(..., min_length=1, description="Experience level, e.g. '2 years'")
    department: str = Field(default="", description="Department, e.g. 'Engineering'")


class PlanDay(BaseModel):
    day: int
    title: str
    tasks: list[str]


class PlanResponse(BaseModel):
    plan: list[PlanDay]


# ── Health ──────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str = "ok"

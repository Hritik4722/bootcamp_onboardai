"""30-day onboarding plan generator using Gemini."""

import json
import re

from backend.services.gemini_service import generate
from backend.models.schemas import PlanDay, PlanResponse
from backend.db.chroma_client import get_or_create_collection
from backend.services.embedding_service import get_embeddings
from backend.core.config import settings

def generate_plan(role: str, experience: str, department: str = "") -> PlanResponse:
    """Generate a structured 30-day onboarding plan using company context (if available) or autonomous generation."""
    
    # 1. Retrieve company context for this role/department
    collection = get_or_create_collection()
    search_query = f"30-day onboarding plan timeline training for {role} in {department} department"
    q_embedding = get_embeddings([search_query])[0]
    
    results = collection.query(
        query_embeddings=[q_embedding],
        n_results=3,
        include=["documents", "metadatas"],
    )
    
    documents = results.get("documents", [[]])[0]
    context_block = "\n\n".join(documents) if documents else ""

    dept_text = f" in the {department} department" if department else ""
    
    prompt = f"""You are an expert HR onboarding strategist.

Create a detailed 30-day onboarding plan for a new employee with the following profile:
- Role: {role}{dept_text}
- Experience: {experience}

--- COMPANY CONTEXT ---
{context_block if context_block else "No specific company documents provided. Please generate a standard industry-best-practice plan autonomously."}
--- END CONTEXT ---

Instructions:
1. Use the COMPANY CONTEXT to structure the plan if it contains relevant onboarding timelines, tools, or tasks.
2. If the context is empty or lacks specific details, autonomously generate a comprehensive, realistic plan.
3. Return the plan as a JSON array with exactly 30 objects. Each object must have:
   - "day": integer (1-30)
   - "title": string (short title for the day)
   - "tasks": array of strings (2-4 specific tasks)

Group days into logical phases:
- Days 1-5: Orientation & Setup
- Days 6-15: Learning & Integration
- Days 16-25: Hands-on & Collaboration
- Days 26-30: Review & Goal Setting

Return ONLY the JSON array, no extra text or markdown formatting.
"""

    raw = generate(prompt)

    # Extract JSON from the response (handle markdown code fences)
    json_match = re.search(r"\[.*\]", raw, re.DOTALL)
    if not json_match:
        raise ValueError("Gemini did not return a valid JSON array for the plan.")

    parsed = json.loads(json_match.group())

    days = [PlanDay(**item) for item in parsed]
    return PlanResponse(plan=days)

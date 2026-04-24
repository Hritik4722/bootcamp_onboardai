"""Plan route — POST /generate-plan for 30-day onboarding plans."""

from fastapi import APIRouter, HTTPException

from backend.models.schemas import PlanRequest, PlanResponse
from backend.services.plan_generator import generate_plan

router = APIRouter()


@router.post("/generate-plan", response_model=PlanResponse)
async def create_plan(request: PlanRequest) -> PlanResponse:
    """Generate a structured 30-day onboarding plan based on role, experience, and department."""
    try:
        plan = generate_plan(role=request.role, experience=request.experience, department=request.department)
        return plan
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plan generation error: {e}")

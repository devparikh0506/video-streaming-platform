from fastapi import APIRouter
from pydantic import BaseModel

from app.common.schemas import ApiResponse

router = APIRouter(tags=["health"])


class HealthData(BaseModel):
    status: str


@router.get("/health", response_model=ApiResponse[HealthData])
async def health_check() -> ApiResponse[HealthData]:
    """Health check endpoint."""
    return ApiResponse(data=HealthData(status="ok"))

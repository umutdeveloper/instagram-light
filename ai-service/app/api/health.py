from fastapi import APIRouter
from app.models.health import HealthResponse
from app.services.nsfw_model_service import nsfw_model_service
from app.core.config import settings

router = APIRouter()


@router.get("/status", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        model_loaded=nsfw_model_service.is_loaded,
        model_name=settings.IMAGE_MODERATION_MODEL_NAME,
    )

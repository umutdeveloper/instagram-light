from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.image_moderation import ImageModerationRequest, ImageModerationResponse
from app.services.image_moderation_service import image_moderation_service

router = APIRouter()

@router.post("/moderate-image", response_model=ImageModerationResponse)
async def moderate_image(
    request: ImageModerationRequest,
    background_tasks: BackgroundTasks
):
    try:
        result = image_moderation_service.moderate_image(str(request.image_url))
        return ImageModerationResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

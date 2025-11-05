from fastapi import APIRouter
from app.api import health, image_moderation

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(image_moderation.router, tags=["Image Moderation"])

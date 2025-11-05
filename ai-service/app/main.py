import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.services.nsfw_model_service import nsfw_model_service

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Service",
    description="AI Service using HuggingFace Transformers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting AI Service...")
    nsfw_model_service.load_model()
    logger.info("Service started successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down AI Service...")

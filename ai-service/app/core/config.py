import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    IMAGE_MODERATION_MODEL_NAME: str = os.getenv("IMAGE_MODERATION_MODEL_NAME", "Falconsai/nsfw_image_detection")
    IMAGE_MODERATION_MAX_IMAGE_SIZE_MB: int = int(os.getenv("IMAGE_MODERATION_MAX_IMAGE_SIZE_MB", "10"))
    IMAGE_MODERATION_NSFW_THRESHOLD: float = float(os.getenv("IMAGE_MODERATION_NSFW_THRESHOLD", "0.95"))
    MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "./model_cache")
    TIMEOUT_SECONDS: int = int(os.getenv("TIMEOUT_SECONDS", "30"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    ALLOWED_ORIGINS: list = ["*"]

settings = Settings()

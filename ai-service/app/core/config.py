import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self):
        self.HOST: str = os.getenv("HOST", "0.0.0.0")
        self.PORT: int = int(os.getenv("PORT", "8000"))
        self.IMAGE_MODERATION_MODEL_NAME: str = os.getenv(
            "IMAGE_MODERATION_MODEL_NAME", "Falconsai/nsfw_image_detection"
        )
        self.IMAGE_MODERATION_MAX_IMAGE_SIZE_MB: int = int(
            os.getenv("IMAGE_MODERATION_MAX_IMAGE_SIZE_MB", "10")
        )
        self.IMAGE_MODERATION_NSFW_THRESHOLD: float = float(
            os.getenv("IMAGE_MODERATION_NSFW_THRESHOLD", "0.95")
        )
        self.MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "./model_cache")
        self.TIMEOUT_SECONDS: int = int(os.getenv("TIMEOUT_SECONDS", "30"))
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
        self.ALLOWED_ORIGINS: list = ["*"]


settings = Settings()

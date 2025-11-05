import io
import logging
import requests
from PIL import Image
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

class ImageService:
    @staticmethod
    def download_image(image_url: str) -> Image.Image:
        try:
            response = requests.get(image_url, timeout=settings.TIMEOUT_SECONDS)
            response.raise_for_status()

            max_size = settings.IMAGE_MODERATION_MAX_IMAGE_SIZE_MB * 1024 * 1024
            if len(response.content) > max_size:
                raise HTTPException(status_code=413, detail="Image too large")
            
            image = Image.open(io.BytesIO(response.content))

            if image.mode != "RGB":
                image = image.convert("RGB")
            
            return image
        except requests.RequestException as e:
            logger.error(f"Failed to download image: {e}")
            raise HTTPException(status_code=400, detail="Failed to download image")
        except Exception as e:
            logger.error(f"Failed to process image: {e}")
            raise HTTPException(status_code=400, detail="Invalid image format")

image_service = ImageService()

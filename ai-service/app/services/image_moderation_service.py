import logging
from app.core.config import settings
from app.services.nsfw_model_service import nsfw_model_service
from app.services.image_service import image_service

logger = logging.getLogger(__name__)


class ImageModerationService:
    @staticmethod
    def moderate_image(image_url: str) -> dict:
        image = image_service.download_image(image_url)

        predicted_probs, id2label = nsfw_model_service.predict(image)

        nsfw_score = 0.0

        for idx, prob in enumerate(predicted_probs):
            label = id2label.get(idx, "").lower()
            if any(
                keyword in label for keyword in ["nsfw", "porn", "adult", "explicit"]
            ):
                nsfw_score = float(prob)
                break

        is_nsfw = nsfw_score > settings.IMAGE_MODERATION_NSFW_THRESHOLD

        logger.info(
            f"Moderated image: NSFW={is_nsfw}, "
            f"score={nsfw_score:.3f}, "
            f"threshold={settings.IMAGE_MODERATION_NSFW_THRESHOLD}, "
            f"labels={id2label}"
        )

        return {
            "nsfw": is_nsfw,
            "score": round(nsfw_score, 3),
            "threshold": settings.IMAGE_MODERATION_NSFW_THRESHOLD,
            "model_name": settings.IMAGE_MODERATION_MODEL_NAME,
        }


image_moderation_service = ImageModerationService()

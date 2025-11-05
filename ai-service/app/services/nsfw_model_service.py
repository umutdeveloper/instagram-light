import os
import logging
import torch
from transformers import AutoModelForImageClassification, AutoImageProcessor
from app.core.config import settings

logger = logging.getLogger(__name__)


class NSFWModelService:
    def __init__(self):
        self.model = None
        self.processor = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"

    def load_model(self):
        if self.model is None:
            logger.info(f"Loading NSFW model: {settings.IMAGE_MODERATION_MODEL_NAME}")

            try:
                os.environ["HF_HOME"] = settings.MODEL_CACHE_DIR
                os.environ["TRANSFORMERS_CACHE"] = settings.MODEL_CACHE_DIR

                self.processor = AutoImageProcessor.from_pretrained(
                    settings.IMAGE_MODERATION_MODEL_NAME
                )
                self.model = AutoModelForImageClassification.from_pretrained(
                    settings.IMAGE_MODERATION_MODEL_NAME
                )

                self.model = self.model.to(self._device)
                self.model.eval()

                logger.info(f"NSFW model loaded successfully on {self._device}")
            except Exception as e:
                logger.error(f"Failed to load NSFW model: {e}")
                raise

        return self.model, self.processor

    def predict(self, image):
        if self.model is None or self.processor is None:
            self.load_model()

        inputs = self.processor(images=image, return_tensors="pt")

        inputs = {k: v.to(self._device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)

        predicted_probs = probs[0].cpu().numpy()

        return predicted_probs, self.model.config.id2label

    @property
    def is_loaded(self):
        return self.model is not None


nsfw_model_service = NSFWModelService()

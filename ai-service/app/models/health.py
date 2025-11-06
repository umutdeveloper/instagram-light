from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    image_moderation_model_loaded: bool
    image_moderation_model_name: str

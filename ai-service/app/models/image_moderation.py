from pydantic import BaseModel, HttpUrl

class ImageModerationRequest(BaseModel):
    image_url: HttpUrl

class ImageModerationResponse(BaseModel):
    nsfw: bool
    score: float
    threshold: float
    model_name: str

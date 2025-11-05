"""Tests for configuration module"""
import os
from app.core.config import Settings


def test_settings_default_values():
    """Test default configuration values"""
    settings = Settings()

    assert settings.HOST == os.getenv("HOST", "0.0.0.0")
    assert settings.PORT == int(os.getenv("PORT", "8000"))
    assert settings.IMAGE_MODERATION_MODEL_NAME == os.getenv(
        "IMAGE_MODERATION_MODEL_NAME", "Falconsai/nsfw_image_detection"
    )
    assert settings.IMAGE_MODERATION_NSFW_THRESHOLD == float(
        os.getenv("IMAGE_MODERATION_NSFW_THRESHOLD", "0.95")
    )
    assert settings.IMAGE_MODERATION_MAX_IMAGE_SIZE_MB == int(
        os.getenv("IMAGE_MODERATION_MAX_IMAGE_SIZE_MB", "10")
    )
    assert settings.TIMEOUT_SECONDS == int(os.getenv("TIMEOUT_SECONDS", "30"))


def test_settings_environment_override(monkeypatch):
    """Test that environment variables override defaults"""
    monkeypatch.setenv("HOST", "127.0.0.1")
    monkeypatch.setenv("PORT", "9000")
    monkeypatch.setenv("IMAGE_MODERATION_MODEL_NAME", "test/model")
    monkeypatch.setenv("IMAGE_MODERATION_NSFW_THRESHOLD", "0.8")

    settings = Settings()

    assert settings.HOST == "127.0.0.1"
    assert settings.PORT == 9000
    assert settings.IMAGE_MODERATION_MODEL_NAME == "test/model"
    assert settings.IMAGE_MODERATION_NSFW_THRESHOLD == 0.8


def test_settings_cors_configuration():
    """Test CORS configuration"""
    settings = Settings()
    assert isinstance(settings.ALLOWED_ORIGINS, list)
    assert "*" in settings.ALLOWED_ORIGINS

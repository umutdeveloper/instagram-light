"""Tests for Pydantic schemas"""
import pytest
from pydantic import ValidationError
from app.models.image_moderation import ImageModerationRequest, ImageModerationResponse
from app.models.health import HealthResponse


class TestImageModerationRequest:
    """Tests for ImageModerationRequest schema"""

    def test_valid_request(self):
        """Test valid moderation request"""
        request = ImageModerationRequest(image_url="https://example.com/image.jpg")
        assert str(request.image_url) == "https://example.com/image.jpg"

    def test_invalid_url(self):
        """Test invalid URL raises validation error"""
        with pytest.raises(ValidationError):
            ImageModerationRequest(image_url="not-a-url")

    def test_missing_url(self):
        """Test missing URL raises validation error"""
        with pytest.raises(ValidationError):
            ImageModerationRequest()


class TestImageModerationResponse:
    """Tests for ImageModerationResponse schema"""

    def test_valid_response(self):
        """Test valid moderation response"""
        response = ImageModerationResponse(
            nsfw=True,
            score=0.85,
            threshold=0.95,
            model_name="AdamCodd/vit-base-nsfw-detector",
        )
        assert response.nsfw is True
        assert response.score == 0.85
        assert response.threshold == 0.95
        assert response.model_name == "AdamCodd/vit-base-nsfw-detector"

    def test_missing_fields(self):
        """Test missing required fields raise validation error"""
        with pytest.raises(ValidationError):
            ImageModerationResponse(nsfw=True, score=0.5)


class TestHealthResponse:
    """Tests for HealthResponse schema"""

    def test_valid_health_response(self):
        """Test valid health check response"""
        response = HealthResponse(
            status="healthy", model_loaded=True, model_name="test/model"
        )
        assert response.status == "healthy"
        assert response.model_loaded is True
        assert response.model_name == "test/model"

    def test_model_not_loaded(self):
        """Test health response when model not loaded"""
        response = HealthResponse(
            status="starting", model_loaded=False, model_name="test/model"
        )
        assert response.model_loaded is False

"""Tests for moderation API endpoints"""
from unittest.mock import patch
from fastapi import HTTPException


class TestImageModerationAPI:
    """Tests for image moderation endpoints"""

    @patch("app.api.image_moderation.image_moderation_service")
    def test_moderate_endpoint_success(self, mock_service, client):
        """Test POST /moderate-image with valid request"""
        mock_service.moderate_image.return_value = {
            "nsfw": True,
            "score": 0.96,
            "threshold": 0.95,
            "model_name": "AdamCodd/vit-base-nsfw-detector",
        }

        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/test.jpg"}
        )

        assert response.status_code == 200
        data = response.json()

        assert data["nsfw"] is True
        assert data["score"] == 0.96
        assert data["threshold"] == 0.95
        assert data["model_name"] == "AdamCodd/vit-base-nsfw-detector"

        mock_service.moderate_image.assert_called_once_with(
            "https://example.com/test.jpg"
        )

    @patch("app.api.image_moderation.image_moderation_service")
    def test_moderate_endpoint_safe_content(self, mock_service, client):
        """Test moderation with safe content"""
        mock_service.moderate_image.return_value = {
            "nsfw": False,
            "score": 0.05,
            "threshold": 0.95,
            "model_name": "AdamCodd/vit-base-nsfw-detector",
        }

        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/safe.jpg"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["nsfw"] is False
        assert data["score"] == 0.05

    def test_moderate_endpoint_invalid_url(self, client):
        """Test moderation with invalid URL"""
        response = client.post("/moderate-image", json={"image_url": "not-a-valid-url"})

        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "detail" in data

    def test_moderate_endpoint_missing_url(self, client):
        """Test moderation without URL"""
        response = client.post("/moderate-image", json={})

        assert response.status_code == 422  # Validation error

    @patch("app.api.image_moderation.image_moderation_service")
    def test_moderate_endpoint_service_error(self, mock_service, client):
        """Test handling of service errors"""
        mock_service.moderate_image.side_effect = Exception("Service error")

        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/test.jpg"}
        )

        assert response.status_code == 500

    @patch("app.api.image_moderation.image_moderation_service")
    def test_moderate_endpoint_http_exception(self, mock_service, client):
        """Test handling of HTTP exceptions"""
        mock_service.moderate_image.side_effect = HTTPException(
            status_code=400, detail="Failed to download image"
        )

        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/bad.jpg"}
        )

        assert response.status_code == 400
        data = response.json()
        assert "Failed to download image" in data["detail"]

    @patch("app.api.image_moderation.image_moderation_service")
    def test_moderate_endpoint_response_schema(self, mock_service, client):
        """Test that response matches ImageModerationResponse schema"""
        mock_service.moderate_image.return_value = {
            "nsfw": True,
            "score": 0.96,
            "threshold": 0.95,
            "model_name": "AdamCodd/vit-base-nsfw-detector",
        }

        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/test.jpg"}
        )

        assert response.status_code == 200
        data = response.json()

        # Verify all required fields
        required_fields = ["nsfw", "score", "threshold", "model_name"]
        for field in required_fields:
            assert field in data

        # Verify types
        assert isinstance(data["nsfw"], bool)
        assert isinstance(data["score"], (int, float))
        assert isinstance(data["threshold"], (int, float))
        assert isinstance(data["model_name"], str)

    @patch("app.api.image_moderation.image_moderation_service")
    def test_moderate_endpoint_various_urls(self, mock_service, client):
        """Test moderation with various URL formats"""
        mock_service.moderate_image.return_value = {
            "nsfw": False,
            "score": 0.1,
            "threshold": 0.95,
            "model_name": "test/model",
        }

        test_urls = [
            "https://example.com/image.jpg",
            "http://example.com/photo.png",
            "https://cdn.example.com/images/test.jpeg",
            "https://example.com/path/to/image.webp",
        ]

        for url in test_urls:
            response = client.post("/moderate-image", json={"image_url": url})
            assert response.status_code == 200

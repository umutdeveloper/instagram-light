"""Tests for health API endpoints"""
from unittest.mock import patch


class TestHealthAPI:
    """Tests for health check endpoints"""

    def test_health_status_endpoint(self, client):
        """Test GET /status endpoint"""
        with patch("app.api.health.nsfw_model_service") as mock_service:
            mock_service.is_loaded = True
            with patch("app.api.health.settings") as mock_settings:
                mock_settings.IMAGE_MODERATION_MODEL_NAME = "test/model"

                response = client.get("/status")

                assert response.status_code == 200
                data = response.json()

                assert "status" in data
                assert "image_moderation_model_loaded" in data
                assert "image_moderation_model_name" in data
                assert data["status"] == "healthy"
                assert data["image_moderation_model_loaded"] is True
                assert data["image_moderation_model_name"] == "test/model"

    def test_health_status_model_not_loaded(self, client):
        """Test status when model is not loaded"""
        with patch("app.api.health.nsfw_model_service") as mock_service:
            mock_service.is_loaded = False
            with patch("app.api.health.settings") as mock_settings:
                mock_settings.IMAGE_MODERATION_MODEL_NAME = "test/model"

                response = client.get("/status")

                assert response.status_code == 200
                data = response.json()
                assert data["image_moderation_model_loaded"] is False

    def test_health_status_response_schema(self, client):
        """Test that response matches HealthResponse schema"""
        with patch("app.api.health.nsfw_model_service") as mock_service:
            mock_service.is_loaded = True
            with patch("app.api.health.settings") as mock_settings:
                mock_settings.IMAGE_MODERATION_MODEL_NAME = (
                    "AdamCodd/vit-base-nsfw-detector"
                )

                response = client.get("/status")

                assert response.status_code == 200
                data = response.json()

                # Verify all required fields
                required_fields = ["status", "image_moderation_model_loaded", "image_moderation_model_name"]
                for field in required_fields:
                    assert field in data

                # Verify types
                assert isinstance(data["status"], str)
                assert isinstance(data["image_moderation_model_loaded"], bool)
                assert isinstance(data["image_moderation_model_name"], str)

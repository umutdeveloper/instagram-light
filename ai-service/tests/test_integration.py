"""Integration tests for the full API"""
from unittest.mock import patch, Mock


class TestIntegration:
    """Full integration tests"""

    @patch("app.services.image_service.requests.get")
    @patch("app.services.nsfw_model_service.AutoImageProcessor.from_pretrained")
    @patch(
        "app.services.nsfw_model_service.AutoModelForImageClassification.from_pretrained"
    )
    def test_full_moderation_flow(
        self,
        mock_model_class,
        mock_processor_class,
        mock_requests_get,
        client,
        sample_image_bytes,
    ):
        """Test complete moderation flow from request to response"""
        # Mock image download
        mock_response = Mock()
        mock_response.content = sample_image_bytes
        mock_response.raise_for_status = Mock()
        mock_requests_get.return_value = mock_response

        # Mock model and processor
        import torch

        mock_processor = Mock()
        mock_processor.return_value = {"pixel_values": torch.randn(1, 3, 224, 224)}

        mock_model = Mock()
        mock_model.config.id2label = {0: "normal", 1: "nsfw"}
        mock_model.parameters = Mock(return_value=[Mock(device="cpu")])
        mock_model.to = Mock(return_value=mock_model)
        mock_model.eval = Mock(return_value=mock_model)

        # Mock model output
        mock_logits = torch.tensor([[2.0, 1.0]])  # normal: 2.0, nsfw: 1.0
        mock_output = Mock()
        mock_output.logits = mock_logits
        mock_model.return_value = mock_output

        mock_processor_class.return_value = mock_processor
        mock_model_class.return_value = mock_model

        # Make request
        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/test.jpg"}
        )

        # Verify response
        assert response.status_code == 200
        data = response.json()

        assert "nsfw" in data
        assert "score" in data
        assert "threshold" in data
        assert "model_name" in data
        assert isinstance(data["nsfw"], bool)
        assert isinstance(data["score"], float)

    def test_api_routes_registered(self, client):
        """Test that all expected routes are registered"""
        # Get OpenAPI schema
        response = client.get("/openapi.json")
        assert response.status_code == 200

        schema = response.json()
        paths = schema["paths"]

        # Verify expected endpoints exist
        assert "/status" in paths
        assert "/moderate-image" in paths

        # Verify HTTP methods
        assert "get" in paths["/status"]
        assert "post" in paths["/moderate-image"]

    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options(
            "/moderate-image",
            headers={
                "Origin": "https://example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )

        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers

    def test_api_documentation_available(self, client):
        """Test that API documentation is available"""
        # Check docs endpoint
        response = client.get("/docs")
        assert response.status_code == 200

        # Check ReDoc endpoint
        response = client.get("/redoc")
        assert response.status_code == 200

    @patch("app.api.image_moderation.image_moderation_service")
    def test_error_handling_chain(self, mock_service, client):
        """Test error handling across the stack"""
        # Test network error
        from fastapi import HTTPException

        mock_service.moderate_image.side_effect = HTTPException(
            status_code=400, detail="Failed to download image"
        )

        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/bad.jpg"}
        )

        assert response.status_code == 400
        assert "download" in response.json()["detail"].lower()

        # Test generic error
        mock_service.moderate_image.side_effect = Exception("Unexpected error")

        response = client.post(
            "/moderate-image", json={"image_url": "https://example.com/test.jpg"}
        )

        assert response.status_code == 500

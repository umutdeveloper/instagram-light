"""Tests for image service"""
import pytest
from unittest.mock import patch, Mock
from PIL import Image
from fastapi import HTTPException
from app.services.image_service import image_service
import io


class TestImageService:
    """Tests for ImageService"""

    @patch("app.services.image_service.requests.get")
    def test_download_image_success(self, mock_get, mock_image_response):
        """Test successful image download"""
        mock_get.return_value = mock_image_response

        result = image_service.download_image("https://example.com/image.jpg")

        assert isinstance(result, Image.Image)
        assert result.mode == "RGB"
        mock_get.assert_called_once()

    @patch("app.services.image_service.requests.get")
    def test_download_image_converts_to_rgb(self, mock_get):
        """Test that images are converted to RGB mode"""
        # Create RGBA image
        img = Image.new("RGBA", (100, 100), color="red")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        mock_response = Mock()
        mock_response.content = buf.getvalue()
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        result = image_service.download_image("https://example.com/image.png")

        assert result.mode == "RGB"

    @patch("app.services.image_service.requests.get")
    def test_download_image_too_large(self, mock_get):
        """Test that large images are rejected (by patching size limit)"""
        # Patch the settings to set a very small max image size (e.g. 1KB)
        from app.services import image_service as service_mod

        old_limit = service_mod.settings.IMAGE_MODERATION_MAX_IMAGE_SIZE_MB
        service_mod.settings.IMAGE_MODERATION_MAX_IMAGE_SIZE_MB = 0.00005  # ~50 bytes

        try:
            img = Image.new("RGB", (10, 10), color="white")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            buf.seek(0)

            mock_response = Mock()
            mock_response.content = buf.getvalue()
            mock_response.raise_for_status = Mock()
            mock_get.return_value = mock_response

            with pytest.raises(HTTPException) as exc_info:
                image_service.download_image("https://example.com/large.png")

            assert exc_info.value.status_code == 413
            assert "too large" in exc_info.value.detail.lower()
        finally:
            service_mod.settings.IMAGE_MODERATION_MAX_IMAGE_SIZE_MB = old_limit

    @patch("app.services.image_service.requests.get")
    def test_download_image_network_error(self, mock_get):
        """Test network error handling"""
        mock_get.side_effect = Exception("Network error")

        with pytest.raises(HTTPException) as exc_info:
            image_service.download_image("https://example.com/image.jpg")

        assert exc_info.value.status_code == 400

    @patch("app.services.image_service.requests.get")
    def test_download_image_invalid_format(self, mock_get):
        """Test invalid image format handling"""
        mock_response = Mock()
        mock_response.content = b"not an image"
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        with pytest.raises(HTTPException) as exc_info:
            image_service.download_image("https://example.com/invalid.jpg")

        assert exc_info.value.status_code == 400
        assert "invalid" in exc_info.value.detail.lower()

    @patch("app.services.image_service.requests.get")
    @patch("app.services.image_service.settings")
    def test_download_image_respects_size_limit(self, mock_settings, mock_get):
        """Test that size limit setting is respected"""
        mock_settings.IMAGE_MODERATION_MAX_IMAGE_SIZE_MB = 5

        # Create mock response with content larger than limit
        mock_response = Mock()
        mock_response.content = b"x" * (6 * 1024 * 1024)  # 6MB
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        with pytest.raises(HTTPException) as exc_info:
            image_service.download_image("https://example.com/large.jpg")

        assert exc_info.value.status_code == 413

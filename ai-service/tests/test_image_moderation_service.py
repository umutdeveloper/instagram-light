"""Tests for moderation service"""
import numpy as np
from unittest.mock import patch
from app.services.image_moderation_service import image_moderation_service


class TestImageModerationService:
    """Tests for ImageModerationService"""

    @patch("app.services.image_moderation_service.nsfw_model_service")
    @patch("app.services.image_moderation_service.image_service")
    def test_moderate_image_nsfw_detected(
        self, mock_img_service, mock_model_service, sample_image
    ):
        """Test NSFW content detection"""
        # Mock image download
        mock_img_service.download_image.return_value = sample_image

        # Mock model prediction - high NSFW score
        probs = np.array([0.04, 0.96])  # [normal: 0.04, nsfw: 0.96]
        id2label = {0: "normal", 1: "nsfw"}
        mock_model_service.predict.return_value = (probs, id2label)

        result = image_moderation_service.moderate_image("https://example.com/nsfw.jpg")

        assert result["nsfw"] is True
        assert result["score"] == 0.96
        assert "threshold" in result
        assert "model_name" in result

    @patch("app.services.image_moderation_service.nsfw_model_service")
    @patch("app.services.image_moderation_service.image_service")
    def test_moderate_image_safe_content(
        self, mock_img_service, mock_model_service, sample_image
    ):
        """Test safe content detection"""
        mock_img_service.download_image.return_value = sample_image

        # Mock model prediction - low NSFW score
        probs = np.array([0.95, 0.05])  # [normal: 0.95, nsfw: 0.05]
        id2label = {0: "normal", 1: "nsfw"}
        mock_model_service.predict.return_value = (probs, id2label)

        result = image_moderation_service.moderate_image("https://example.com/safe.jpg")

        assert result["nsfw"] is False
        assert result["score"] == 0.05

    @patch("app.services.image_moderation_service.nsfw_model_service")
    @patch("app.services.image_moderation_service.image_service")
    def test_moderate_image_threshold_boundary(
        self, mock_img_service, mock_model_service, sample_image
    ):
        """Test threshold boundary condition"""
        mock_img_service.download_image.return_value = sample_image

        # Mock model prediction - exactly at threshold
        probs = np.array([0.05, 0.95])
        id2label = {0: "normal", 1: "nsfw"}
        mock_model_service.predict.return_value = (probs, id2label)

        with patch("app.services.image_moderation_service.settings") as mock_settings:
            mock_settings.IMAGE_MODERATION_NSFW_THRESHOLD = 0.95
            result = image_moderation_service.moderate_image(
                "https://example.com/boundary.jpg"
            )

            # Should not be flagged (> threshold, not >=)
            assert result["nsfw"] is False

    @patch("app.services.image_moderation_service.nsfw_model_service")
    @patch("app.services.image_moderation_service.image_service")
    def test_moderate_image_different_labels(
        self, mock_img_service, mock_model_service, sample_image
    ):
        """Test handling of different label formats"""
        mock_img_service.download_image.return_value = sample_image

        # Test with "porn" label
        probs = np.array([0.04, 0.96])
        id2label = {0: "safe", 1: "porn"}
        mock_model_service.predict.return_value = (probs, id2label)

        result = image_moderation_service.moderate_image("https://example.com/test.jpg")
        assert result["nsfw"] is True  # "porn" keyword should be detected

        # Test with "adult" label
        id2label = {0: "safe", 1: "adult"}
        mock_model_service.predict.return_value = (probs, id2label)

        result = image_moderation_service.moderate_image("https://example.com/test.jpg")
        assert result["nsfw"] is True  # "adult" keyword should be detected

    @patch("app.services.image_moderation_service.nsfw_model_service")
    @patch("app.services.image_moderation_service.image_service")
    def test_moderate_image_rounds_score(
        self, mock_img_service, mock_model_service, sample_image
    ):
        """Test that score is rounded to 3 decimal places"""
        mock_img_service.download_image.return_value = sample_image

        probs = np.array([0.4567, 0.5433])
        id2label = {0: "normal", 1: "nsfw"}
        mock_model_service.predict.return_value = (probs, id2label)

        result = image_moderation_service.moderate_image("https://example.com/test.jpg")

        assert result["score"] == 0.543  # Rounded to 3 decimals

    @patch("app.services.image_moderation_service.nsfw_model_service")
    @patch("app.services.image_moderation_service.image_service")
    def test_moderate_image_model_name_in_response(
        self, mock_img_service, mock_model_service, sample_image
    ):
        """Test that model name is included in response"""
        mock_img_service.download_image.return_value = sample_image

        probs = np.array([0.5, 0.5])
        id2label = {0: "normal", 1: "nsfw"}
        mock_model_service.predict.return_value = (probs, id2label)

        with patch("app.services.image_moderation_service.settings") as mock_settings:
            mock_settings.IMAGE_MODERATION_MODEL_NAME = (
                "AdamCodd/vit-base-nsfw-detector"
            )
            mock_settings.IMAGE_MODERATION_NSFW_THRESHOLD = 0.95

            result = image_moderation_service.moderate_image(
                "https://example.com/test.jpg"
            )

            assert result["model_name"] == "AdamCodd/vit-base-nsfw-detector"

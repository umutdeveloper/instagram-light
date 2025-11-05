"""Tests for model service"""
import pytest
import torch
import numpy as np
from unittest.mock import patch, Mock
from app.services.nsfw_model_service import NSFWModelService


class TestNSFWModelService:
    """Tests for NSFWModelService"""

    def test_model_service_initialization(self):
        """Test model service initializes correctly"""
        service = NSFWModelService()
        assert service.model is None
        assert service.processor is None
        assert service._device in ["cpu", "cuda"]

    @patch("app.services.nsfw_model_service.AutoImageProcessor.from_pretrained")
    @patch(
        "app.services.nsfw_model_service.AutoModelForImageClassification.from_pretrained"
    )
    def test_load_model_success(self, mock_model_class, mock_processor_class):
        """Test successful model loading"""
        mock_processor = Mock()
        mock_model = Mock()
        mock_model.to = Mock(return_value=mock_model)
        mock_model.eval = Mock(return_value=mock_model)

        mock_processor_class.return_value = mock_processor
        mock_model_class.return_value = mock_model

        service = NSFWModelService()
        model, processor = service.load_model()

        assert model is not None
        assert processor is not None
        mock_model_class.assert_called_once()
        mock_processor_class.assert_called_once()
        mock_model.eval.assert_called_once()

    @patch("app.services.nsfw_model_service.AutoImageProcessor.from_pretrained")
    @patch(
        "app.services.nsfw_model_service.AutoModelForImageClassification.from_pretrained"
    )
    def test_load_model_caching(self, mock_model_class, mock_processor_class):
        """Test that model is cached after first load"""
        mock_processor = Mock()
        mock_model = Mock()
        mock_model.to = Mock(return_value=mock_model)
        mock_model.eval = Mock(return_value=mock_model)

        mock_processor_class.return_value = mock_processor
        mock_model_class.return_value = mock_model

        service = NSFWModelService()

        # First load
        service.load_model()
        # Second load should use cached model
        service.load_model()

        # Should only be called once due to caching
        assert mock_model_class.call_count == 1
        assert mock_processor_class.call_count == 1

    @patch("app.services.nsfw_model_service.AutoImageProcessor.from_pretrained")
    @patch(
        "app.services.nsfw_model_service.AutoModelForImageClassification.from_pretrained"
    )
    def test_load_model_failure(self, mock_model_class, mock_processor_class):
        """Test model loading failure handling"""
        mock_model_class.side_effect = Exception("Model not found")

        service = NSFWModelService()

        with pytest.raises(Exception):
            service.load_model()

    @patch("app.services.nsfw_model_service.torch.no_grad")
    def test_predict_success(
        self, mock_no_grad, sample_image, mock_model, mock_processor
    ):
        """Test successful prediction"""
        service = NSFWModelService()
        service.model = mock_model
        service.processor = mock_processor

        # Mock processor output
        mock_inputs = {"pixel_values": torch.randn(1, 3, 224, 224)}
        mock_processor.return_value = mock_inputs

        # Mock model output
        mock_logits = torch.tensor([[1.0, 2.0]])  # [normal, nsfw]
        mock_output = Mock()
        mock_output.logits = mock_logits
        mock_model.return_value = mock_output
        mock_model.parameters = Mock(return_value=[Mock(device="cpu")])

        probs, id2label = service.predict(sample_image)

        assert isinstance(probs, np.ndarray)
        assert len(probs) == 2
        assert id2label == {0: "normal", 1: "nsfw"}
        mock_processor.assert_called_once()

    def test_is_loaded_property(self):
        """Test is_loaded property"""
        service = NSFWModelService()
        assert service.is_loaded is False

        service.model = Mock()
        assert service.is_loaded is True

    @patch("app.services.nsfw_model_service.torch.cuda.is_available")
    def test_device_selection_gpu(self, mock_cuda):
        """Test GPU device selection when available"""
        mock_cuda.return_value = True
        service = NSFWModelService()
        assert service._device == "cuda"

    @patch("app.services.nsfw_model_service.torch.cuda.is_available")
    def test_device_selection_cpu(self, mock_cuda):
        """Test CPU device selection when GPU unavailable"""
        mock_cuda.return_value = False
        service = NSFWModelService()
        assert service._device == "cpu"

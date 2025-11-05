"""Pytest configuration and fixtures"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from PIL import Image
import io


@pytest.fixture
def client():
    """Create a test client"""
    # Mock model loading to avoid downloading model during tests
    with patch("app.services.nsfw_model_service.nsfw_model_service.load_model"):
        from app.main import app

        return TestClient(app)


@pytest.fixture
def mock_model():
    """Mock ML model"""
    mock = Mock()
    mock.config.id2label = {0: "normal", 1: "nsfw"}
    return mock


@pytest.fixture
def mock_processor():
    """Mock image processor"""
    return Mock()


@pytest.fixture
def sample_image():
    """Create a sample test image"""
    img = Image.new("RGB", (100, 100), color="red")
    return img


@pytest.fixture
def sample_image_bytes():
    """Create sample image as bytes"""
    img = Image.new("RGB", (100, 100), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()


@pytest.fixture
def mock_image_response(sample_image_bytes):
    """Mock requests response with image"""
    mock_response = Mock()
    mock_response.content = sample_image_bytes
    mock_response.status_code = 200
    mock_response.raise_for_status = Mock()
    return mock_response


@pytest.fixture
def mock_model_output():
    """Mock model output with logits"""
    mock_output = Mock()
    # Simulate logits for [normal, nsfw] classes
    mock_output.logits = Mock()
    return mock_output

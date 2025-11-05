.PHONY: help install install-dev test test-cov lint format clean

help:
	@echo "Available commands:"
	@echo "  make install      - Install production dependencies"
	@echo "  make install-dev  - Install development dependencies"
	@echo "  make test         - Run tests"
	@echo "  make test-cov     - Run tests with coverage report"
	@echo "  make lint         - Run code linting"
	@echo "  make format       - Format code with black"
	@echo "  make clean        - Clean cache and build files"

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements-dev.txt

test:
	pytest tests/ -v -W error

test-cov:
	pytest tests/ -v --cov=app

lint:
	flake8 app tests
	mypy app

format:
	black app tests

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .mypy_cache -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf htmlcov
	rm -rf .coverage
	rm -rf coverage.xml

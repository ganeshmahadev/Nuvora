.PHONY: install dev test lint format healthcheck

install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest tests/ -v

lint:
	ruff check app/ tests/

format:
	ruff format app/ tests/

healthcheck:
	curl -f http://localhost:8000/healthz || exit 1
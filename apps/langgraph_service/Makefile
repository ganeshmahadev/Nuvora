.PHONY: install dev test docker-up docker-down lint format

install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest tests/ -v

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-build:
	docker compose build

docker-logs:
	docker compose logs -f langgraph-service

lint:
	ruff check app/ tests/

format:
	ruff format app/ tests/

healthcheck:
	curl -f http://localhost:8000/healthz || exit 1
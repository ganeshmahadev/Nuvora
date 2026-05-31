import os
from app.config import settings


def setup_tracing() -> None:
    if settings.LANGSMITH_API_KEY:
        os.environ.setdefault("LANGSMITH_API_KEY", settings.LANGSMITH_API_KEY)
        os.environ.setdefault("LANGSMITH_PROJECT", settings.LANGSMITH_PROJECT)
        os.environ.setdefault("LANGSMITH_TRACING", str(settings.LANGSMITH_TRACING).lower())
from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/postgres"
    LANGGRAPH_SCHEMA: str = "langgraph"

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    PRIMARY_LLM: str = "openai:gpt-4o-mini"
    FALLBACK_LLM: str = "anthropic:claude-sonnet-4-5"

    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "nuvora-dev"
    LANGSMITH_TRACING: bool = True

    LANGGRAPH_SERVICE_TOKEN: str = ""
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"

    RATE_LIMIT_DAILY_GIST_PER_DAY: int = 2
    RATE_LIMIT_MEAL_COACH_PER_HOUR: int = 10
    RATE_LIMIT_SLEEP_INSIGHT_PER_DAY: int = 2


settings = Settings()
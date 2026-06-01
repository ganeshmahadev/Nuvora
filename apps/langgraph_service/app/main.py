from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
import structlog

from app.config import settings
from app.api import health, insights, foods

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer()
        if settings.ENVIRONMENT == "development"
        else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        min_level=getattr(logging, settings.LOG_LEVEL, logging.INFO)
    ),
)

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("insight_service.starting", environment=settings.ENVIRONMENT)
    yield
    log.info("insight_service.stopped")


app = FastAPI(
    title="Nuvora Insight Service",
    version="0.2.0",
    lifespan=lifespan,
)

app.include_router(health.router)
app.include_router(insights.router, prefix="/insights", tags=["insights"])
app.include_router(foods.router, prefix="/foods", tags=["foods"])
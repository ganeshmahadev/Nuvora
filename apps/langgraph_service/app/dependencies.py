from fastapi import Request
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import structlog

log = structlog.get_logger()


async def get_checkpointer(request: Request) -> AsyncPostgresSaver:
    checkpointer = getattr(request.app.state, "checkpointer", None)
    if checkpointer is None:
        raise RuntimeError("Checkpointer not initialized. Start the app first.")
    return checkpointer
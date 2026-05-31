from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
import json
import structlog

from app.auth import verify_service_token, get_user_id
from app.dependencies import get_checkpointer
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

log = structlog.get_logger()
router = APIRouter()


@router.post("/trigger")
async def trigger_insight(
    category: str,
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    log.info("insight.trigger", category=category, user_id=x_user_id)
    return {"status": "triggered", "category": category, "insight_id": "stub"}


@router.get("/stream/{insight_id}")
async def stream_insight(
    insight_id: str,
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    log.info("insight.stream", insight_id=insight_id, user_id=x_user_id)

    async def event_stream() -> AsyncGenerator[str, None]:
        yield format_sse({"type": "pending", "insight_id": insight_id, "message": "Graph execution not yet implemented"})
        yield format_sse({"type": "complete", "insight_id": insight_id})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/{insight_id}")
async def get_insight(
    insight_id: str,
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
):
    log.info("insight.get", insight_id=insight_id, user_id=x_user_id)
    return {"status": "stub", "insight_id": insight_id}


def format_sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"
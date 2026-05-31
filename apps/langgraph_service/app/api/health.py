from fastapi import APIRouter, Depends
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.auth import verify_service_token
from app.dependencies import get_checkpointer
import structlog

log = structlog.get_logger()
router = APIRouter()


@router.get("/healthz")
async def healthz():
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(
    _token: str = Depends(verify_service_token),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    db_ok = False
    try:
        config = {"configurable": {"thread_id": "__readyz_check__"}}
        await checkpointer.aget(config)
        db_ok = True
    except Exception as e:
        log.error("readyz.database_check_failed", error=str(e))

    if db_ok:
        return {"status": "ready", "database": "connected"}
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=503,
        content={"status": "not_ready", "database": "unreachable"},
    )
from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.auth import verify_service_token
import structlog

log = structlog.get_logger()
router = APIRouter()


@router.get("/healthz")
async def healthz():
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(
    _token: str = Depends(verify_service_token),
):
    return {"status": "ready"}
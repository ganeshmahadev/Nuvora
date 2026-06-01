from fastapi import APIRouter, Depends, Header, HTTPException, status
import structlog

from app.auth import verify_service_token
from app.config import settings
from app.schemas.insight import InsightGenerateRequest, INSIGHT_CATEGORIES
from app.services.insight_service import (
    generate_insight,
    get_latest_insight,
    get_current_log_count,
)

log = structlog.get_logger()
router = APIRouter()


@router.post("/generate")
async def generate(
    body: InsightGenerateRequest,
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
):
    log.info("insights.generate", category=body.category, user_id=x_user_id)

    if body.category not in INSIGHT_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {INSIGHT_CATEGORIES}",
        )

    try:
        result = await generate_insight(
            user_id=x_user_id,
            category=body.category,
            reference_date=body.reference_date,
            force_regenerate=body.force_regenerate,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        log.error("insights.generate_failed", category=body.category, user_id=x_user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Insight generation failed: {str(e)}",
        )

    return result


@router.get("/latest")
async def latest(
    category: str,
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
):
    log.info("insights.latest", category=category, user_id=x_user_id)

    if category not in INSIGHT_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {INSIGHT_CATEGORIES}",
        )

    existing = get_latest_insight(x_user_id, category)

    if existing and existing.get("generation_status") == "complete":
        current_count = get_current_log_count(x_user_id, category)
        stored_count = existing.get("log_count_at_generation", 0) or 0
        if current_count <= stored_count:
            return {**existing, "status": "complete", "from_cache": True}

    try:
        result = await generate_insight(user_id=x_user_id, category=category)
        return result
    except FileNotFoundError:
        if existing:
            return {**existing, "status": "complete", "from_cache": True, "stale": True}
        return {
            "status": "insufficient_data",
            "category": category,
            "hint": "Keep tracking to unlock personalized insights.",
            "log_count": get_current_log_count(x_user_id, category),
            "min_required": settings.MIN_LOGS_FOR_INSIGHT,
        }
    except Exception as e:
        log.error("insights.latest_failed", category=category, user_id=x_user_id, error=str(e))
        if existing:
            return {**existing, "status": "complete", "from_cache": True, "stale": True}
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
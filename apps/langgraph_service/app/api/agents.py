from fastapi import APIRouter, Depends, Header, HTTPException, status
import structlog

from app.auth import verify_service_token, get_user_id
from app.dependencies import get_checkpointer
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

log = structlog.get_logger()
router = APIRouter()


@router.post("/daily-gist/trigger")
async def trigger_daily_gist(
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    log.info("agent.daily_gist.trigger", user_id=x_user_id)
    return {"status": "triggered", "graph": "daily_gist", "insight_id": "stub"}


@router.post("/meal-coach/trigger")
async def trigger_meal_coach(
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    log.info("agent.meal_coach.trigger", user_id=x_user_id)
    return {"status": "triggered", "graph": "meal_coach", "insight_id": "stub"}


@router.post("/sleep-insight/trigger")
async def trigger_sleep_insight(
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    log.info("agent.sleep_insight.trigger", user_id=x_user_id)
    return {"status": "triggered", "graph": "sleep_insight", "insight_id": "stub"}


@router.post("/activity-coach/trigger")
async def trigger_activity_coach(
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    log.info("agent.activity_coach.trigger", user_id=x_user_id)
    return {"status": "triggered", "graph": "activity_coach", "insight_id": "stub"}


@router.post("/goal-calibration/trigger")
async def trigger_goal_calibration(
    _token: str = Depends(verify_service_token),
    x_user_id: str = Header(..., alias="X-User-Id"),
    checkpointer: AsyncPostgresSaver = Depends(get_checkpointer),
):
    log.info("agent.goal_calibration.trigger", user_id=x_user_id)
    return {"status": "triggered", "graph": "goal_calibration", "insight_id": "stub"}
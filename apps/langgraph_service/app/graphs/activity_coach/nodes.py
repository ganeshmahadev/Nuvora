from langgraph.config import get_stream_writer
from langsmith import traceable
import structlog

from app.graphs.activity_coach.state import ActivityCoachState

log = structlog.get_logger()


@traceable(run_type="chain", name="recovery_assessor")
async def recovery_assessor(state: ActivityCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "recovery_assessor", "status": "start"})
    log.info("activity_coach.recovery_assessor", user_id=state["user_id"])
    writer({"node": "recovery_assessor", "status": "complete"})
    return {}


@traceable(run_type="chain", name="workout_recommender")
async def workout_recommender(state: ActivityCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "workout_recommender", "status": "start"})
    log.info("activity_coach.workout_recommender", user_id=state["user_id"])
    writer({"node": "workout_recommender", "status": "complete"})
    return {}


@traceable(run_type="chain", name="rationale_writer")
async def rationale_writer(state: ActivityCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "rationale_writer", "status": "start"})
    log.info("activity_coach.rationale_writer", user_id=state["user_id"])
    writer({"node": "rationale_writer", "status": "complete"})
    return {}


@traceable(run_type="chain", name="persistence")
async def persistence(state: ActivityCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "persistence", "status": "start"})
    log.info("activity_coach.persistence", user_id=state["user_id"])
    writer({"node": "persistence", "status": "complete"})
    return {}
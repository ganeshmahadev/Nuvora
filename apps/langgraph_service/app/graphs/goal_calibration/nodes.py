from langgraph.config import get_stream_writer
from langsmith import traceable
import structlog

from app.graphs.goal_calibration.state import GoalCalibrationState

log = structlog.get_logger()


@traceable(run_type="chain", name="progress_analyser")
async def progress_analyser(state: GoalCalibrationState) -> dict:
    writer = get_stream_writer()
    writer({"node": "progress_analyser", "status": "start"})
    log.info("goal_calibration.progress_analyser", user_id=state["user_id"])
    writer({"node": "progress_analyser", "status": "complete"})
    return {}


@traceable(run_type="chain", name="context_adjuster")
async def context_adjuster(state: GoalCalibrationState) -> dict:
    writer = get_stream_writer()
    writer({"node": "context_adjuster", "status": "start"})
    log.info("goal_calibration.context_adjuster", user_id=state["user_id"])
    writer({"node": "context_adjuster", "status": "complete"})
    return {}


@traceable(run_type="chain", name="target_recalculator")
async def target_recalculator(state: GoalCalibrationState) -> dict:
    writer = get_stream_writer()
    writer({"node": "target_recalculator", "status": "start"})
    log.info("goal_calibration.target_recalculator", user_id=state["user_id"])
    writer({"node": "target_recalculator", "status": "complete"})
    return {}


@traceable(run_type="chain", name="human_review_gate")
async def human_review_gate(state: GoalCalibrationState) -> dict:
    writer = get_stream_writer()
    writer({"node": "human_review_gate", "status": "start"})
    log.info("goal_calibration.human_review_gate", user_id=state["user_id"])
    writer({"node": "human_review_gate", "status": "complete"})
    return {}


@traceable(run_type="chain", name="persistence")
async def persistence(state: GoalCalibrationState) -> dict:
    writer = get_stream_writer()
    writer({"node": "persistence", "status": "start"})
    log.info("goal_calibration.persistence", user_id=state["user_id"])
    writer({"node": "persistence", "status": "complete"})
    return {}
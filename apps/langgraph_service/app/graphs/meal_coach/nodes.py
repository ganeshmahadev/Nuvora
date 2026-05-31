from langgraph.config import get_stream_writer
from langsmith import traceable
import structlog

from app.graphs.meal_coach.state import MealCoachState

log = structlog.get_logger()


@traceable(run_type="chain", name="meal_analyser")
async def meal_analyser(state: MealCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "meal_analyser", "status": "start"})
    log.info("meal_coach.meal_analyser", user_id=state["user_id"], meal_id=state["meal_id"])
    writer({"node": "meal_analyser", "status": "complete"})
    return {}


@traceable(run_type="chain", name="substitute_finder")
async def substitute_finder(state: MealCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "substitute_finder", "status": "start"})
    log.info("meal_coach.substitute_finder", user_id=state["user_id"])
    writer({"node": "substitute_finder", "status": "complete"})
    return {}


@traceable(run_type="chain", name="protein_recommender")
async def protein_recommender(state: MealCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "protein_recommender", "status": "start"})
    log.info("meal_coach.protein_recommender", user_id=state["user_id"])
    writer({"node": "protein_recommender", "status": "complete"})
    return {}


@traceable(run_type="chain", name="persistence")
async def persistence(state: MealCoachState) -> dict:
    writer = get_stream_writer()
    writer({"node": "persistence", "status": "start"})
    log.info("meal_coach.persistence", user_id=state["user_id"])
    writer({"node": "persistence", "status": "complete"})
    return {}
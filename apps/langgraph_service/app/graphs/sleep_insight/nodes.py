from langgraph.config import get_stream_writer
from langsmith import traceable
import structlog

from app.graphs.sleep_insight.state import SleepInsightState

log = structlog.get_logger()


@traceable(run_type="chain", name="pattern_analyser")
async def pattern_analyser(state: SleepInsightState) -> dict:
    writer = get_stream_writer()
    writer({"node": "pattern_analyser", "status": "start"})
    log.info("sleep_insight.pattern_analyser", user_id=state["user_id"])
    writer({"node": "pattern_analyser", "status": "complete"})
    return {}


@traceable(run_type="chain", name="factor_correlator")
async def factor_correlator(state: SleepInsightState) -> dict:
    writer = get_stream_writer()
    writer({"node": "factor_correlator", "status": "start"})
    log.info("sleep_insight.factor_correlator", user_id=state["user_id"])
    writer({"node": "factor_correlator", "status": "complete"})
    return {}


@traceable(run_type="chain", name="hygiene_recommender")
async def hygiene_recommender(state: SleepInsightState) -> dict:
    writer = get_stream_writer()
    writer({"node": "hygiene_recommender", "status": "start"})
    log.info("sleep_insight.hygiene_recommender", user_id=state["user_id"])
    writer({"node": "hygiene_recommender", "status": "complete"})
    return {}


@traceable(run_type="chain", name="protocol_builder")
async def protocol_builder(state: SleepInsightState) -> dict:
    writer = get_stream_writer()
    writer({"node": "protocol_builder", "status": "start"})
    log.info("sleep_insight.protocol_builder", user_id=state["user_id"])
    writer({"node": "protocol_builder", "status": "complete"})
    return {}


@traceable(run_type="chain", name="persistence")
async def persistence(state: SleepInsightState) -> dict:
    writer = get_stream_writer()
    writer({"node": "persistence", "status": "start"})
    log.info("sleep_insight.persistence", user_id=state["user_id"])
    writer({"node": "persistence", "status": "complete"})
    return {}
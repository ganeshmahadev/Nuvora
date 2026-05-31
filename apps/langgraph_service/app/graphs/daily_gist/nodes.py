from langgraph.config import get_stream_writer
from langsmith import traceable
from datetime import datetime
import structlog

from app.graphs.daily_gist.state import DailyGistState

log = structlog.get_logger()


@traceable(run_type="chain", name="data_collector")
async def data_collector(state: DailyGistState) -> dict:
    writer = get_stream_writer()
    writer({"node": "data_collector", "status": "start"})
    log.info("daily_gist.data_collector", user_id=state["user_id"], date=state["date"])
    writer({"node": "data_collector", "status": "complete"})
    return {}


@traceable(run_type="chain", name="context_enricher")
async def context_enricher(state: DailyGistState) -> dict:
    writer = get_stream_writer()
    writer({"node": "context_enricher", "status": "start"})
    log.info("daily_gist.context_enricher", user_id=state["user_id"])
    writer({"node": "context_enricher", "status": "complete"})
    return {}


@traceable(run_type="chain", name="pattern_detector")
async def pattern_detector(state: DailyGistState) -> dict:
    writer = get_stream_writer()
    writer({"node": "pattern_detector", "status": "start"})
    log.info("daily_gist.pattern_detector", user_id=state["user_id"])
    writer({"node": "pattern_detector", "status": "complete", "patterns_found": 0})
    return {}


@traceable(run_type="chain", name="recommendation_synthesizer")
async def recommendation_synthesizer(state: DailyGistState) -> dict:
    writer = get_stream_writer()
    writer({"node": "recommendation_synthesizer", "status": "start"})
    log.info("daily_gist.recommendation_synthesizer", user_id=state["user_id"])
    writer({"node": "recommendation_synthesizer", "status": "complete"})
    return {}


@traceable(run_type="chain", name="gist_writer")
async def gist_writer(state: DailyGistState) -> dict:
    writer = get_stream_writer()
    writer({"node": "gist_writer", "status": "start"})
    log.info("daily_gist.gist_writer", user_id=state["user_id"])
    score = compute_fallback_score(state)
    gist = f"Today's readiness: {score}/100. Keep logging to unlock deeper insights."
    writer({"node": "gist_writer", "status": "complete", "gist_preview": gist[:80]})
    return {"gist": gist, "readiness_score": score}


@traceable(run_type="chain", name="persistence")
async def persistence(state: DailyGistState) -> dict:
    writer = get_stream_writer()
    writer({"node": "persistence", "status": "start"})
    log.info("daily_gist.persistence", user_id=state["user_id"])
    writer({"node": "persistence", "status": "complete"})
    return {}


def compute_fallback_score(state: DailyGistState) -> int:
    score = 75
    sleep = state.get("sleep_log") or {}
    if sleep.get("sleep_score"):
        score = sleep["sleep_score"]
    return max(0, min(100, score))
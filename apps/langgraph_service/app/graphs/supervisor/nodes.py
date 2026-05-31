from langgraph.config import get_stream_writer
from langsmith import traceable
import structlog

from app.graphs.supervisor.state import SupervisorState

log = structlog.get_logger()


@traceable(run_type="chain", name="query_classifier")
async def query_classifier(state: SupervisorState) -> dict:
    writer = get_stream_writer()
    writer({"node": "query_classifier", "status": "start"})
    log.info("supervisor.query_classifier", user_id=state["user_id"])
    writer({"node": "query_classifier", "status": "complete"})
    return {}


@traceable(run_type="chain", name="result_aggregator")
async def result_aggregator(state: SupervisorState) -> dict:
    writer = get_stream_writer()
    writer({"node": "result_aggregator", "status": "start"})
    log.info("supervisor.result_aggregator", user_id=state["user_id"])
    writer({"node": "result_aggregator", "status": "complete"})
    return {}


@traceable(run_type="chain", name="answer_writer")
async def answer_writer(state: SupervisorState) -> dict:
    writer = get_stream_writer()
    writer({"node": "answer_writer", "status": "start"})
    log.info("supervisor.answer_writer", user_id=state["user_id"])
    writer({"node": "answer_writer", "status": "complete"})
    return {}
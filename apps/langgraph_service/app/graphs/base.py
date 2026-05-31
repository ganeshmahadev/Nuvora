from langgraph.graph import StateGraph, START, END
from langgraph.config import get_stream_writer
from typing import Any
import structlog

log = structlog.get_logger()


class GraphBuildError(Exception):
    pass


def add_stream_writer_to_node(node_name: str, state: dict, writer_payload: dict | None = None) -> None:
    writer = get_stream_writer()
    writer({"node": node_name, "status": "start", **(writer_payload or {})})
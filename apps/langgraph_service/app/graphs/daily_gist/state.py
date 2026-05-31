from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class DailyGistState(TypedDict):
    user_id: str
    date: str
    profile: dict | None
    yesterday_rollup: dict | None
    sleep_log: dict | None
    activity_log: dict | None
    context: dict | None
    patterns: list[dict] | None
    gist: str | None
    readiness_score: int | None
    messages: Annotated[list, add_messages]
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class SleepInsightState(TypedDict):
    user_id: str
    sleep_id: str
    last_night: dict | None
    last_7_nights: list[dict] | None
    contextual_factors: list[str] | None
    hygiene_recommendations: list[dict] | None
    time_to_quiet_trend: dict | None
    messages: Annotated[list, add_messages]
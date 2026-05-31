from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class ActivityCoachState(TypedDict):
    user_id: str
    date: str
    last_night_sleep_score: int | None
    week_training_load: dict | None
    activity_streak: int | None
    hrv_trend: str | None
    recommendation: dict | None
    rationale: str | None
    messages: Annotated[list, add_messages]
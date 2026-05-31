from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class GoalCalibrationState(TypedDict):
    user_id: str
    current_goals: dict | None
    progress_4w: dict | None
    context: dict | None
    proposed_goals: dict | None
    delta_rationale: str | None
    messages: Annotated[list, add_messages]
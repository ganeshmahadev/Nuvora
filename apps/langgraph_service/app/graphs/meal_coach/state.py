from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages


class MealCoachState(TypedDict):
    user_id: str
    meal_id: str
    meal_items: list[dict] | None
    meal_type: str | None
    daily_so_far: dict | None
    targets: dict | None
    substitutes: list[dict] | None
    protein_recommendation: str | None
    messages: Annotated[list, add_messages]
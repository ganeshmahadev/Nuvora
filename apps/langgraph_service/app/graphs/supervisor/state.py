from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages


class SupervisorState(TypedDict):
    user_id: str
    question: str
    sub_results: dict | None
    final_answer: str | None
    messages: Annotated[list, add_messages]
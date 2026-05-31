from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.graphs.activity_coach.state import ActivityCoachState
from app.graphs.activity_coach import nodes


def build_activity_coach_graph(checkpointer: AsyncPostgresSaver):
    workflow = StateGraph(ActivityCoachState)

    workflow.add_node("recovery_assessor", nodes.recovery_assessor)
    workflow.add_node("workout_recommender", nodes.workout_recommender)
    workflow.add_node("rationale_writer", nodes.rationale_writer)
    workflow.add_node("persistence", nodes.persistence)

    workflow.add_edge(START, "recovery_assessor")
    workflow.add_edge("recovery_assessor", "workout_recommender")
    workflow.add_edge("workout_recommender", "rationale_writer")
    workflow.add_edge("rationale_writer", "persistence")
    workflow.add_edge("persistence", END)

    return workflow.compile(checkpointer=checkpointer)
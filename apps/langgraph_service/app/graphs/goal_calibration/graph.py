from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.graphs.goal_calibration.state import GoalCalibrationState
from app.graphs.goal_calibration import nodes


def build_goal_calibration_graph(checkpointer: AsyncPostgresSaver):
    workflow = StateGraph(GoalCalibrationState)

    workflow.add_node("progress_analyser", nodes.progress_analyser)
    workflow.add_node("context_adjuster", nodes.context_adjuster)
    workflow.add_node("target_recalculator", nodes.target_recalculator)
    workflow.add_node("human_review_gate", nodes.human_review_gate)
    workflow.add_node("persistence", nodes.persistence)

    workflow.add_edge(START, "progress_analyser")
    workflow.add_edge("progress_analyser", "context_adjuster")
    workflow.add_edge("context_adjuster", "target_recalculator")
    workflow.add_edge("target_recalculator", "human_review_gate")
    workflow.add_edge("human_review_gate", "persistence")
    workflow.add_edge("persistence", END)

    return workflow.compile(checkpointer=checkpointer)
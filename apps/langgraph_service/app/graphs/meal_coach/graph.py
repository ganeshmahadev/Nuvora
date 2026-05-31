from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.graphs.meal_coach.state import MealCoachState
from app.graphs.meal_coach import nodes


def build_meal_coach_graph(checkpointer: AsyncPostgresSaver):
    workflow = StateGraph(MealCoachState)

    workflow.add_node("meal_analyser", nodes.meal_analyser)
    workflow.add_node("substitute_finder", nodes.substitute_finder)
    workflow.add_node("protein_recommender", nodes.protein_recommender)
    workflow.add_node("persistence", nodes.persistence)

    workflow.add_edge(START, "meal_analyser")
    workflow.add_edge("meal_analyser", "substitute_finder")
    workflow.add_edge("substitute_finder", "protein_recommender")
    workflow.add_edge("protein_recommender", "persistence")
    workflow.add_edge("persistence", END)

    return workflow.compile(checkpointer=checkpointer)
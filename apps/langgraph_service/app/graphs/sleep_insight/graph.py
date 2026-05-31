from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.graphs.sleep_insight.state import SleepInsightState
from app.graphs.sleep_insight import nodes


def build_sleep_insight_graph(checkpointer: AsyncPostgresSaver):
    workflow = StateGraph(SleepInsightState)

    workflow.add_node("pattern_analyser", nodes.pattern_analyser)
    workflow.add_node("factor_correlator", nodes.factor_correlator)
    workflow.add_node("hygiene_recommender", nodes.hygiene_recommender)
    workflow.add_node("protocol_builder", nodes.protocol_builder)
    workflow.add_node("persistence", nodes.persistence)

    workflow.add_edge(START, "pattern_analyser")
    workflow.add_edge("pattern_analyser", "factor_correlator")
    workflow.add_edge("factor_correlator", "hygiene_recommender")
    workflow.add_edge("hygiene_recommender", "protocol_builder")
    workflow.add_edge("protocol_builder", "persistence")
    workflow.add_edge("persistence", END)

    return workflow.compile(checkpointer=checkpointer)
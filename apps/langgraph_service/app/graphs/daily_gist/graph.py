from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.graphs.daily_gist.state import DailyGistState
from app.graphs.daily_gist import nodes


def build_daily_gist_graph(checkpointer: AsyncPostgresSaver):
    workflow = StateGraph(DailyGistState)

    workflow.add_node("data_collector", nodes.data_collector)
    workflow.add_node("context_enricher", nodes.context_enricher)
    workflow.add_node("pattern_detector", nodes.pattern_detector)
    workflow.add_node("recommendation_synthesizer", nodes.recommendation_synthesizer)
    workflow.add_node("gist_writer", nodes.gist_writer)
    workflow.add_node("persistence", nodes.persistence)

    workflow.add_edge(START, "data_collector")
    workflow.add_edge("data_collector", "context_enricher")
    workflow.add_edge("context_enricher", "pattern_detector")
    workflow.add_edge("pattern_detector", "recommendation_synthesizer")
    workflow.add_edge("recommendation_synthesizer", "gist_writer")
    workflow.add_edge("gist_writer", "persistence")
    workflow.add_edge("persistence", END)

    return workflow.compile(checkpointer=checkpointer)
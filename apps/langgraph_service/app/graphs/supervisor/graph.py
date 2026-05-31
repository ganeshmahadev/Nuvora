from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.graphs.supervisor.state import SupervisorState
from app.graphs.supervisor import nodes


def build_supervisor_graph(checkpointer: AsyncPostgresSaver):
    workflow = StateGraph(SupervisorState)

    workflow.add_node("query_classifier", nodes.query_classifier)
    workflow.add_node("result_aggregator", nodes.result_aggregator)
    workflow.add_node("answer_writer", nodes.answer_writer)

    workflow.add_edge(START, "query_classifier")
    workflow.add_edge("query_classifier", "result_aggregator")
    workflow.add_edge("result_aggregator", "answer_writer")
    workflow.add_edge("answer_writer", END)

    return workflow.compile(checkpointer=checkpointer)
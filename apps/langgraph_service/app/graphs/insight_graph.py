import json
from typing import Any

import structlog
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.config import settings
from app.schemas.graph_state import InsightState, AnalysisResult
from app.schemas.insight import InsightData
from app.services.llm_service import structured_call
from app.services.supabase_service import get_user_location
from app.services.data_service import load_prompt, fetch_temperature

log = structlog.get_logger()

# Shared in-memory checkpointer for state persistence within the process lifetime
_checkpointer = MemorySaver()

ANALYZE_PROMPT_TEMPLATE = """You are a health data analyst for Nuvora Health. Analyze the following {category} logs.

Data:
{logs_json}

Identify:
1. Key metrics and statistics (calculate averages, totals, ranges where relevant)
2. Behavioral patterns (timing, consistency, trends over time)
3. Anomalies or notable deviations from healthy norms

Respond ONLY with valid JSON (no markdown fences, no explanation):
{{
  "key_metrics": {{"metric_name": "value_as_string"}},
  "patterns": ["concise pattern description"],
  "anomalies": ["anomaly or empty list if none"]
}}"""


async def fetch_data_node(state: InsightState) -> dict[str, Any]:
    """Validates state and enriches context with category-specific external data."""
    category = state["category"]
    logs = state["logs"]

    if len(logs) < settings.MIN_LOGS_FOR_INSIGHT:
        return {
            "insufficient_data": True,
            "error": f"Insufficient data: need at least {settings.MIN_LOGS_FOR_INSIGHT} {category} entries.",
        }

    context: dict[str, Any] = {}

    if category == "water_hydration":
        user_id = state["user_id"]
        location_city = get_user_location(user_id)
        temp_c = fetch_temperature(location_city) if location_city else None
        context["location_city"] = location_city or "unknown"
        context["temperature_c"] = f"{temp_c:.1f}" if temp_c is not None else "unknown"

        profile = state.get("profile") or {}
        water_target_ml = profile.get("water_target_ml")
        context["water_target_ml"] = str(int(water_target_ml)) if water_target_ml else "unknown"

    return {"context": context, "insufficient_data": False}


async def analyze_node(state: InsightState) -> dict[str, Any]:
    """First LLM pass: extract key metrics, patterns, and anomalies from raw logs."""
    category = state["category"]
    logs = state["logs"]

    prompt = ANALYZE_PROMPT_TEMPLATE.format(
        category=category.replace("_", " "),
        logs_json=json.dumps(logs, default=str, indent=2),
    )

    try:
        result = await structured_call(prompt, AnalysisResult)
        log.info("graph.analyze_complete", category=category, patterns=len(result.patterns))
        return {"analysis": result.model_dump()}
    except Exception as e:
        log.warning("graph.analyze_failed", category=category, error=str(e))
        return {"analysis": {"key_metrics": {}, "patterns": [], "anomalies": []}}


async def synthesize_node(state: InsightState) -> dict[str, Any]:
    """Second LLM pass: generate final insight using raw logs + analysis."""
    user_id = state["user_id"]
    category = state["category"]
    reference_date = state["reference_date"]
    logs = state["logs"]
    analysis = state.get("analysis") or {}
    context = state.get("context") or {}

    prompt_template = load_prompt(category)
    analysis_str = json.dumps(analysis, indent=2)

    prompt = (
        prompt_template
        .replace("{{user_id}}", user_id)
        .replace("{{reference_date}}", reference_date)
        .replace("{{inputs}}", json.dumps(logs, default=str))
        .replace("{{analysis}}", analysis_str)
    )

    if category == "water_hydration":
        prompt = (
            prompt
            .replace("{{location_city}}", context.get("location_city", "unknown"))
            .replace("{{temperature_c}}", context.get("temperature_c", "unknown"))
            .replace("{{water_target_ml}}", context.get("water_target_ml", "unknown"))
        )

    result = await structured_call(prompt, InsightData)
    log.info("graph.synthesize_complete", category=category, title=result.title)
    return {"insight": result.model_dump()}


def _route_after_fetch(state: InsightState) -> str:
    return "__end__" if state.get("insufficient_data") else "analyze"


def _build_graph() -> Any:
    builder = StateGraph(InsightState)

    builder.add_node("fetch_data", fetch_data_node)
    builder.add_node("analyze", analyze_node)
    builder.add_node("synthesize", synthesize_node)

    builder.set_entry_point("fetch_data")
    builder.add_conditional_edges(
        "fetch_data",
        _route_after_fetch,
        {"analyze": "analyze", "__end__": END},
    )
    builder.add_edge("analyze", "synthesize")
    builder.add_edge("synthesize", END)

    return builder.compile(checkpointer=_checkpointer)


_graph = _build_graph()


async def run_insight_graph(
    user_id: str,
    category: str,
    reference_date: str,
    logs: list[dict],
    profile: dict | None,
) -> InsightData | None:
    """Run the 3-node insight graph and return a parsed InsightData, or None if insufficient data."""
    initial_state: InsightState = {
        "user_id": user_id,
        "category": category,
        "reference_date": reference_date,
        "logs": logs,
        "profile": profile,
        "context": {},
        "analysis": None,
        "insight": None,
        "error": None,
        "insufficient_data": False,
    }
    config = {"configurable": {"thread_id": f"{user_id}:{category}"}}

    result = await _graph.ainvoke(initial_state, config=config)

    if result.get("insufficient_data"):
        return None

    insight_dict = result.get("insight")
    if not insight_dict:
        return None

    return InsightData(**insight_dict)

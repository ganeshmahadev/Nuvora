import hashlib
import json
from datetime import date

import structlog

from app.config import settings
from app.services.supabase_service import get_supabase_client, upsert_insight, get_profile
from app.services.data_service import fetch_user_logs
from app.schemas.insight import InsightData

log = structlog.get_logger()


def compute_input_hash(logs: list[dict], category: str) -> str:
    raw = json.dumps(logs, sort_keys=True, default=str)
    return hashlib.md5(f"{category}:{raw}".encode()).hexdigest()[:12]


def get_latest_insight(user_id: str, category: str) -> dict | None:
    client = get_supabase_client()
    result = (
        client.table("insights")
        .select("id, category, title, body, structured_data, generation_status, reference_date, created_at, log_count_at_generation, input_hash")
        .eq("user_id", user_id)
        .eq("category", category)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        return None
    row = result.data[0]
    sd = row.get("structured_data") or {}
    row["recommendation"] = sd.get("recommendation")
    return row


async def generate_insight(
    user_id: str,
    category: str,
    reference_date: str | None = None,
    force_regenerate: bool = False,
) -> dict:
    # Import here to avoid circular import at module level
    from app.graphs.insight_graph import run_insight_graph

    ref_date = reference_date or date.today().isoformat()

    logs = fetch_user_logs(user_id, category)
    min_logs = settings.MIN_LOGS_FOR_INSIGHT

    if len(logs) < min_logs:
        log.info("insight.insufficient_data", user_id=user_id, category=category, log_count=len(logs))
        return {
            "status": "insufficient_data",
            "category": category,
            "hint": f"Keep tracking! We need at least {min_logs} {category.replace('_', ' ')} entries to generate personalized insights.",
            "log_count": len(logs),
            "min_required": min_logs,
        }

    input_hash = compute_input_hash(logs, category)
    current_log_count = len(logs)

    if not force_regenerate:
        existing = get_latest_insight(user_id, category)
        if existing and existing.get("generation_status") == "complete":
            existing_hash = existing.get("input_hash")
            existing_count = existing.get("log_count_at_generation") or 0
            if existing_hash == input_hash or existing_count >= current_log_count:
                log.info("insight.cache_hit", user_id=user_id, category=category)
                return {**existing, "status": "complete", "from_cache": True}

    profile = get_profile(user_id)

    try:
        llm_result: InsightData | None = await run_insight_graph(
            user_id=user_id,
            category=category,
            reference_date=ref_date,
            logs=logs,
            profile=profile,
        )
    except Exception as e:
        log.error("insight.graph_failed", user_id=user_id, category=category, error=str(e))
        raise

    if llm_result is None:
        log.error("insight.graph_no_result", user_id=user_id, category=category)
        raise RuntimeError(f"Graph returned no insight for {category} despite sufficient data")

    title = llm_result.title
    body = llm_result.body
    recommendation = llm_result.recommendation
    structured_data = llm_result.structured_data
    if not isinstance(structured_data, dict):
        structured_data = None

    insight = upsert_insight(
        user_id=user_id,
        category=category,
        scope="daily",
        reference_date=ref_date,
        title=title,
        body=body,
        structured_data={
            **(structured_data or {}),
            "recommendation": recommendation,
        },
        generation_status="complete",
        completed_at=date.today().isoformat(),
        input_hash=input_hash,
        log_count_at_generation=current_log_count,
    )

    log.info("insight.generated", user_id=user_id, category=category, insight_id=insight.get("id"))
    return {
        "status": "complete",
        "from_cache": False,
        "id": insight.get("id"),
        "category": category,
        "title": title,
        "body": body,
        "recommendation": recommendation,
        "structured_data": structured_data,
        "generation_status": "complete",
        "reference_date": ref_date,
        "created_at": insight.get("created_at"),
        "input_hash": input_hash,
        "log_count_at_generation": current_log_count,
    }

import hashlib
import json
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import httpx
import structlog

from app.config import settings
from app.services.llm_service import structured_call
from app.services.supabase_service import get_supabase_client, upsert_insight, get_user_location, get_profile
from app.schemas.insight import InsightData, InsufficientDataResponse

log = structlog.get_logger()

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

CATEGORY_LOG_QUERIES = {
    "water_hydration": {
        "table": "water_logs",
        "columns": "id, date, amount_ml, logged_at",
        "order": "logged_at",
        "days": 14,
    },
    "weight_trend": {
        "table": "weight_logs",
        "columns": "id, date, weight_kg, notes, created_at",
        "order": "date",
        "days": 30,
    },
    "sleep_hygiene": {
        "table": "sleep_logs",
        "columns": "id, date, bed_time, wake_time, duration_minutes, subjective_quality, notes, created_at",
        "order": "date",
        "days": 14,
    },
    "activity_recommendation": {
        "table": "activity_logs",
        "columns": "id, date, activity_type, duration_minutes, calories_burned, intensity_label, created_at",
        "order": "date",
        "days": 14,
    },
    "meal_nutrition": {
        "table": "meal_logs",
        "columns": "id, date, meal_type, created_at",
        "days": 7,
        "order": "date",
        "join_items": True,
    },
    "daily_gist": {
        "table": "daily_rollups",
        "columns": "date, total_calories, total_protein_g, total_carb_g, total_fat_g, total_water_ml, sleep_duration_minutes, sleep_quality, active_minutes, total_calories_burned, weight_kg",
        "order": "date",
        "days": 7,
    },
}


def _fetch_daily_gist_summary(user_id: str, days: int = 7) -> list[dict]:
    """Aggregate daily summaries from raw log tables, bypassing daily_rollups."""
    client = get_supabase_client()
    from_date = (date.today() - timedelta(days=days)).isoformat()

    summaries: dict[str, dict] = {}

    def day(d: str) -> dict:
        if d not in summaries:
            summaries[d] = {
                "date": d,
                "total_calories": None,
                "total_protein_g": None,
                "total_carb_g": None,
                "total_fat_g": None,
                "total_water_ml": None,
                "sleep_duration_minutes": None,
                "sleep_quality": None,
                "active_minutes": None,
                "total_calories_burned": None,
                "weight_kg": None,
            }
        return summaries[d]

    # Water
    water = (
        client.table("water_logs")
        .select("date, amount_ml")
        .eq("user_id", user_id)
        .gte("date", from_date)
        .execute()
        .data or []
    )
    for row in water:
        s = day(row["date"])
        s["total_water_ml"] = (s["total_water_ml"] or 0) + (row.get("amount_ml") or 0)

    # Sleep
    sleep = (
        client.table("sleep_logs")
        .select("date, duration_minutes, subjective_quality")
        .eq("user_id", user_id)
        .gte("date", from_date)
        .execute()
        .data or []
    )
    for row in sleep:
        s = day(row["date"])
        s["sleep_duration_minutes"] = row.get("duration_minutes")
        s["sleep_quality"] = row.get("subjective_quality")

    # Activity
    activity = (
        client.table("activity_logs")
        .select("date, duration_minutes, calories_burned")
        .eq("user_id", user_id)
        .gte("date", from_date)
        .execute()
        .data or []
    )
    for row in activity:
        s = day(row["date"])
        s["active_minutes"] = (s["active_minutes"] or 0) + (row.get("duration_minutes") or 0)
        s["total_calories_burned"] = (s["total_calories_burned"] or 0) + (row.get("calories_burned") or 0)

    # Meals + items
    meals = (
        client.table("meal_logs")
        .select("id, date")
        .eq("user_id", user_id)
        .gte("date", from_date)
        .execute()
        .data or []
    )
    if meals:
        meal_ids = [m["id"] for m in meals]
        meal_date = {m["id"]: m["date"] for m in meals}
        items = (
            client.table("meal_items")
            .select("meal_log_id, calories_total, protein_g_total, carb_g_total, fat_g_total")
            .in_("meal_log_id", meal_ids)
            .execute()
            .data or []
        )
        for item in items:
            d = meal_date.get(item["meal_log_id"])
            if not d:
                continue
            s = day(d)
            s["total_calories"] = (s["total_calories"] or 0) + (item.get("calories_total") or 0)
            s["total_protein_g"] = (s["total_protein_g"] or 0) + (item.get("protein_g_total") or 0)
            s["total_carb_g"] = (s["total_carb_g"] or 0) + (item.get("carb_g_total") or 0)
            s["total_fat_g"] = (s["total_fat_g"] or 0) + (item.get("fat_g_total") or 0)

    # Weight (most recent per day)
    weights = (
        client.table("weight_logs")
        .select("date, weight_kg")
        .eq("user_id", user_id)
        .gte("date", from_date)
        .order("date", desc=True)
        .execute()
        .data or []
    )
    seen: set[str] = set()
    for row in weights:
        if row["date"] not in seen:
            day(row["date"])["weight_kg"] = row.get("weight_kg")
            seen.add(row["date"])

    return sorted(summaries.values(), key=lambda x: x["date"], reverse=True)


def fetch_user_logs(user_id: str, category: str, days: int | None = None) -> list[dict]:
    if category == "daily_gist":
        return _fetch_daily_gist_summary(user_id, days or 7)

    config = CATEGORY_LOG_QUERIES.get(category)
    if not config:
        log.warning("insight.unknown_category", category=category)
        return []

    client = get_supabase_client()
    from_date = (date.today() - timedelta(days=days or config["days"])).isoformat()

    query = (
        client.table(config["table"])
        .select(config["columns"])
        .eq("user_id", user_id)
        .gte("date", from_date)
        .order(config["order"], desc=True)
        .limit(30)
    )

    result = query.execute()
    logs = result.data or []

    if category == "meal_nutrition" and config.get("join_items"):
        for meal in logs:
            items_result = client.table("meal_items").select(
                "quantity_g, calories_total, protein_g_total, carb_g_total, fat_g_total, food:foods(name)"
            ).eq("meal_log_id", meal["id"]).execute()
            meal["items"] = items_result.data or []

    return logs


def load_prompt(category: str) -> str:
    prompt_path = PROMPTS_DIR / category / "generate.md"
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt not found: {prompt_path}")
    return prompt_path.read_text(encoding="utf-8")


def fetch_temperature(city: str) -> float | None:
    try:
        geo = httpx.get(
            f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1",
            timeout=5,
        ).json()
        result = (geo.get("results") or [None])[0]
        if not result:
            return None
        wx = httpx.get(
            f"https://api.open-meteo.com/v1/forecast?latitude={result['latitude']}&longitude={result['longitude']}&current=temperature_2m",
            timeout=5,
        ).json()
        return wx.get("current", {}).get("temperature_2m")
    except Exception:
        return None


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


def get_current_log_count(user_id: str, category: str) -> int:
    if category == "daily_gist":
        return len(_fetch_daily_gist_summary(user_id, 7))

    config = CATEGORY_LOG_QUERIES.get(category)
    if not config:
        return 0
    client = get_supabase_client()
    from_date = (date.today() - timedelta(days=config["days"])).isoformat()

    result = (
        client.table(config["table"])
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("date", from_date)
        .execute()
    )

    if hasattr(result, 'count') and result.count is not None:
        return result.count
    return len(result.data or [])


async def generate_insight(
    user_id: str,
    category: str,
    reference_date: str | None = None,
    force_regenerate: bool = False,
) -> dict:
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

    prompt_template = load_prompt(category)
    prompt = prompt_template.replace("{{user_id}}", user_id).replace("{{reference_date}}", ref_date).replace("{{inputs}}", json.dumps(logs, default=str))

    if category == "water_hydration":
        location_city = get_user_location(user_id)
        temp_c = fetch_temperature(location_city) if location_city else None
        profile = get_profile(user_id)
        water_target_ml = (profile or {}).get("water_target_ml")
        water_target_str = str(int(water_target_ml)) if water_target_ml else "unknown"
        prompt = prompt.replace("{{location_city}}", location_city or "unknown")
        prompt = prompt.replace("{{temperature_c}}", f"{temp_c:.1f}" if temp_c is not None else "unknown")
        prompt = prompt.replace("{{water_target_ml}}", water_target_str)

    try:
        llm_result = await structured_call(prompt, InsightData, inputs={"logs": logs, "category": category})
    except Exception as e:
        log.error("insight.llm_failed", user_id=user_id, category=category, error=str(e))
        raise

    title = getattr(llm_result, "title", f"{category.replace('_', ' ').title()} Insight")
    body = getattr(llm_result, "body", "No insight available.")
    recommendation = getattr(llm_result, "recommendation", None)
    structured_data = getattr(llm_result, "structured_data", None)
    if isinstance(structured_data, InsightData):
        structured_data = structured_data.model_dump()
    elif not isinstance(structured_data, dict):
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
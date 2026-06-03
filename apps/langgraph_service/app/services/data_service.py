from datetime import date, timedelta
from pathlib import Path

import httpx
import structlog

from app.services.supabase_service import get_supabase_client

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
        log.warning("data_service.unknown_category", category=category)
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

    if hasattr(result, "count") and result.count is not None:
        return result.count
    return len(result.data or [])

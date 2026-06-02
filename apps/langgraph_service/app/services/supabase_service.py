from supabase import create_client, Client
from app.config import settings
import structlog

log = structlog.get_logger()

_client: Client | None = None


def get_supabase_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client


def get_profile(user_id: str) -> dict | None:
    client = get_supabase_client()
    result = client.table("profiles").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None


def get_daily_rollup(user_id: str, date: str) -> dict | None:
    client = get_supabase_client()
    result = client.table("daily_rollups").select("*").eq("user_id", user_id).eq("date", date).execute()
    return result.data[0] if result.data else None


def get_latest_sleep_log(user_id: str, date: str) -> dict | None:
    client = get_supabase_client()
    result = client.table("sleep_logs").select("*").eq("user_id", user_id).eq("date", date).execute()
    return result.data[0] if result.data else None


def get_latest_activity_log(user_id: str, date: str) -> dict | None:
    client = get_supabase_client()
    result = client.table("activity_logs").select("*").eq("user_id", user_id).eq("date", date).execute()
    return result.data[0] if result.data else None


def get_user_location(user_id: str) -> str | None:
    client = get_supabase_client()
    result = client.table("profiles").select("location_city").eq("id", user_id).execute()
    return (result.data[0] or {}).get("location_city") if result.data else None


def upsert_insight(
    user_id: str,
    category: str,
    scope: str,
    reference_date: str,
    title: str,
    body: str,
    structured_data: dict | None = None,
    generation_status: str = "complete",
    completed_at: str | None = None,
    input_hash: str | None = None,
    log_count_at_generation: int | None = None,
) -> dict:
    client = get_supabase_client()
    payload = {
        "user_id": user_id,
        "category": category,
        "scope": scope,
        "reference_date": reference_date,
        "title": title,
        "body": body,
        "structured_data": structured_data,
        "generation_status": generation_status,
        "completed_at": completed_at,
    }
    if input_hash is not None:
        payload["input_hash"] = input_hash
    if log_count_at_generation is not None:
        payload["log_count_at_generation"] = log_count_at_generation
    result = client.table("insights").upsert(payload).execute()
    return result.data[0] if result.data else {}
from supabase import AsyncClient, create_client
from app.config import settings
import structlog

log = structlog.get_logger()

_client: AsyncClient | None = None


async def get_supabase_client() -> AsyncClient:
    global _client
    if _client is None:
        _client = await create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client


async def get_profile(user_id: str) -> dict | None:
    client = await get_supabase_client()
    result = await client.table("profiles").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None


async def get_daily_rollup(user_id: str, date: str) -> dict | None:
    client = await get_supabase_client()
    result = await client.table("daily_rollups").select("*").eq("user_id", user_id).eq("date", date).execute()
    return result.data[0] if result.data else None


async def get_latest_sleep_log(user_id: str, date: str) -> dict | None:
    client = await get_supabase_client()
    result = await client.table("sleep_logs").select("*").eq("user_id", user_id).eq("date", date).execute()
    return result.data[0] if result.data else None


async def get_latest_activity_log(user_id: str, date: str) -> dict | None:
    client = await get_supabase_client()
    result = await client.table("activity_logs").select("*").eq("user_id", user_id).eq("date", date).execute()
    return result.data[0] if result.data else None


async def upsert_insight(
    user_id: str,
    category: str,
    scope: str,
    reference_date: str,
    title: str,
    body: str,
    structured_data: dict | None = None,
    generation_status: str = "complete",
    completed_at: str | None = None,
) -> dict:
    client = await get_supabase_client()
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
    result = await client.table("insights").upsert(payload).execute()
    return result.data[0] if result.data else {}
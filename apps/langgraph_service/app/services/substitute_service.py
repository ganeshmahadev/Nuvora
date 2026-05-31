from supabase import AsyncClient
from app.services.supabase_service import get_supabase_client
import structlog

log = structlog.get_logger()


async def find_substitutes(source_food_id: str, reason: str | None = None) -> list[dict]:
    client = await get_supabase_client()
    query = client.table("substitutes_catalog").select(
        "*, source:foods!substitutes_catalog_source_food_id_fkey(*), substitute:foods!substitutes_catalog_substitute_food_id_fkey(*)"
    ).eq("source_food_id", source_food_id)

    if reason:
        query = query.eq("reason", reason)

    result = await query.execute()
    return result.data
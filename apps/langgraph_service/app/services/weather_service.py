import httpx
from app.config import settings
import structlog

log = structlog.get_logger()


async def get_weather(lat: float, lon: float) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current_weather": True,
                    "timezone": "auto",
                },
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        log.warning("weather.fetch_failed", error=str(e))
        return None
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.config import settings
import structlog

log = structlog.get_logger()

_api_key_header = APIKeyHeader(name="Authorization", scheme_name="BearerToken")


async def verify_service_token(authorization: str = Security(_api_key_header)) -> str:
    if authorization.startswith("Bearer "):
        token = authorization[len("Bearer "):]
    else:
        token = authorization

    if not settings.LANGGRAPH_SERVICE_TOKEN:
        log.warning("auth.no_token_configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service token not configured",
        )

    if token != settings.LANGGRAPH_SERVICE_TOKEN:
        log.warning("auth.invalid_token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid service token",
        )

    return token


def get_user_id(x_user_id: str) -> str:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-User-Id header required",
        )
    return x_user_id
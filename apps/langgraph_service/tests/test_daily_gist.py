import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings


@pytest.fixture
async def auth_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_healthz_no_auth_required(auth_client: AsyncClient):
    response = await auth_client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_agents_trigger_requires_auth(auth_client: AsyncClient):
    response = await auth_client.post("/agents/daily-gist/trigger")
    assert response.status_code == 403
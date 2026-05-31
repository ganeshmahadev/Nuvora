import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_healthz(client: AsyncClient):
    response = await client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_readyz_requires_auth(client: AsyncClient):
    response = await client.get("/readyz")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_insights_trigger_requires_auth(client: AsyncClient):
    response = await client.post("/insights/trigger?category=daily_gist")
    assert response.status_code == 403
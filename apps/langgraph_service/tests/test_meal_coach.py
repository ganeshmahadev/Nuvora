import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def auth_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_meal_coach_trigger_requires_auth(auth_client: AsyncClient):
    response = await auth_client.post("/agents/meal-coach/trigger")
    assert response.status_code == 403
from httpx import AsyncClient


async def test_health_check(client: AsyncClient) -> None:
    response = await client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "data": {"status": "ok"},
        "error": None,
    }

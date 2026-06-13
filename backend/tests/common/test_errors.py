import pytest
from fastapi import FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient
from pydantic import BaseModel

from app.common.errors import register_exception_handlers


@pytest.fixture
def error_app() -> FastAPI:
    app = FastAPI()
    register_exception_handlers(app)

    class Body(BaseModel):
        size: int
        title: str

    @app.post("/echo")
    async def echo(body: Body) -> dict:
        return {"ok": True}

    @app.get("/teapot")
    async def teapot() -> dict:
        raise HTTPException(status_code=418, detail="I am a teapot")

    @app.get("/boom")
    async def boom() -> dict:
        raise RuntimeError("secret internal detail")

    return app


@pytest.fixture
async def err_client(error_app: FastAPI) -> AsyncClient:
    # raise_app_exceptions=False so the re-raised 500 surfaces as a response.
    transport = ASGITransport(app=error_app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


async def test_validation_error_uses_envelope(err_client: AsyncClient) -> None:
    resp = await err_client.post("/echo", json={"size": "not-an-int"})
    assert resp.status_code == 422
    body = resp.json()
    assert body["success"] is False
    assert body["data"] is None
    assert body["error"].startswith("Validation error")
    assert "size" in body["error"]


async def test_http_exception_uses_envelope(err_client: AsyncClient) -> None:
    resp = await err_client.get("/teapot")
    assert resp.status_code == 418
    assert resp.json() == {"success": False, "data": None, "error": "I am a teapot"}


async def test_unknown_route_uses_envelope(err_client: AsyncClient) -> None:
    resp = await err_client.get("/does-not-exist")
    assert resp.status_code == 404
    body = resp.json()
    assert body["success"] is False
    assert body["data"] is None


async def test_unhandled_exception_is_generic_and_leakproof(
    err_client: AsyncClient,
) -> None:
    resp = await err_client.get("/boom")
    assert resp.status_code == 500
    assert resp.json() == {
        "success": False,
        "data": None,
        "error": "Internal server error",
    }
    assert "secret internal detail" not in resp.text

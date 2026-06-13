from collections.abc import AsyncIterator
from contextlib import AsyncExitStack, asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients.dynamodb import open_dynamodb_client
from app.clients.s3 import open_s3_clients
from app.common.errors import register_exception_handlers
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.modules.health.router import router as health_router
from app.modules.uploads.router import router as uploads_router
from app.modules.videos.router import router as videos_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Open long-lived async S3 clients once; close them on shutdown.
    async with AsyncExitStack() as stack:
        s3_client, s3_presign_client = await open_s3_clients(stack)
        app.state.s3_client = s3_client
        app.state.s3_presign_client = s3_presign_client
        app.state.dynamodb_client = await open_dynamodb_client(stack)
        yield


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    register_exception_handlers(app)
    app.include_router(health_router, prefix=settings.api_prefix)
    app.include_router(uploads_router, prefix=settings.api_prefix)
    app.include_router(videos_router, prefix=settings.api_prefix)
    return app


app = create_app()

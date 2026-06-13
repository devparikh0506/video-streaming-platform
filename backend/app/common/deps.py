from collections.abc import Generator
from typing import TYPE_CHECKING, Annotated

from fastapi import Depends, HTTPException, Path, Request, status

from app.core.config import Settings, get_settings
from app.core.identifiers import is_valid_dash_filename, is_valid_video_key

if TYPE_CHECKING:
    # Typed S3 client (method signatures, return types) for static analysis only.
    from types_aiobotocore_s3 import S3Client
else:
    # At runtime aioboto3 hands us a dynamically-generated AioBaseClient.
    from aiobotocore.client import AioBaseClient as S3Client


def settings_dependency() -> Generator[Settings, None, None]:
    yield get_settings()


def get_s3_client(request: Request) -> "S3Client":
    """Long-lived S3 client opened at app startup (see app.main lifespan)."""
    return request.app.state.s3_client


def get_s3_presign_client(request: Request) -> "S3Client":
    """Long-lived S3 client for generating browser-facing presigned URLs."""
    return request.app.state.s3_presign_client


def valid_video_key(video_key: Annotated[str, Path()]) -> str:
    """Validate a path-param video_key against the strict key format."""
    if not is_valid_video_key(video_key):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Invalid video key")
    return video_key


def valid_dash_filename(filename: Annotated[str, Path()]) -> str:
    """Validate a DASH artifact filename — guards against path traversal."""
    if not is_valid_dash_filename(filename):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Invalid filename")
    return filename


# Annotated aliases for concise route/service signatures.
SettingsDep = Annotated[Settings, Depends(settings_dependency)]
S3ClientDep = Annotated["S3Client", Depends(get_s3_client)]
S3PresignClientDep = Annotated["S3Client", Depends(get_s3_presign_client)]
ValidVideoKey = Annotated[str, Depends(valid_video_key)]
ValidDashFilename = Annotated[str, Depends(valid_dash_filename)]

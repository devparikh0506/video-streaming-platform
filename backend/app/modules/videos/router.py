from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.common.deps import ValidDashFilename, ValidVideoKey
from app.common.schemas import ApiResponse
from app.modules.videos.catalog import (
    RESTORE_VISIBILITY,
    SOFT_DELETE_VISIBILITY,
    VideoCatalogServiceDep,
)
from app.modules.videos.schemas import (
    CategoryListData,
    DeleteVideoData,
    VideoDetail,
    VideoListData,
    VideoVisibilityData,
)
from app.modules.videos.service import VideoStreamServiceDep
from app.repositories.video_repository import (
    DEFAULT_PAGE_LIMIT,
    MAX_PAGE_LIMIT,
    VideoStatus,
)

router = APIRouter(prefix="/videos", tags=["videos"])

_ALLOWED_STATUSES = {
    VideoStatus.UPLOADING,
    VideoStatus.QUEUED,
    VideoStatus.PROCESSING,
    VideoStatus.READY,
    VideoStatus.FAILED,
}


@router.get("", response_model=ApiResponse[VideoListData])
async def list_videos(
    service: VideoCatalogServiceDep,
    category: Annotated[str | None, Query(max_length=50)] = None,
    status_filter: Annotated[str | None, Query(alias="status", max_length=20)] = None,
    limit: Annotated[int, Query(ge=1, le=MAX_PAGE_LIMIT)] = DEFAULT_PAGE_LIMIT,
    cursor: Annotated[str | None, Query()] = None,
) -> ApiResponse[VideoListData]:
    """List videos with optional category/status filters and cursor pagination."""
    if status_filter is not None and status_filter not in _ALLOWED_STATUSES:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Invalid status filter: {status_filter}",
        )
    data = await service.list_videos(
        category=category,
        status_filter=status_filter,
        limit=limit,
        cursor=cursor,
    )
    return ApiResponse(data=data)


@router.get("/categories", response_model=ApiResponse[CategoryListData])
async def list_categories(
    service: VideoCatalogServiceDep,
) -> ApiResponse[CategoryListData]:
    """List the distinct video categories."""
    data = await service.list_categories()
    return ApiResponse(data=data)


@router.get("/{video_key}", response_model=ApiResponse[VideoDetail])
async def get_video(
    video_key: ValidVideoKey,
    service: VideoCatalogServiceDep,
) -> ApiResponse[VideoDetail]:
    """Full metadata for a single video, including the manifest path when ready."""
    data = await service.get_video(video_key)
    return ApiResponse(data=data)


@router.post("/{video_key}/hide", response_model=ApiResponse[VideoVisibilityData])
async def hide_video(
    video_key: ValidVideoKey,
    service: VideoCatalogServiceDep,
) -> ApiResponse[VideoVisibilityData]:
    """Soft delete: hide the video from listings without removing its files."""
    data = await service.set_visibility(video_key, SOFT_DELETE_VISIBILITY)
    return ApiResponse(data=data)


@router.post("/{video_key}/restore", response_model=ApiResponse[VideoVisibilityData])
async def restore_video(
    video_key: ValidVideoKey,
    service: VideoCatalogServiceDep,
) -> ApiResponse[VideoVisibilityData]:
    """Undo a soft delete: make the video visible in listings again."""
    data = await service.set_visibility(video_key, RESTORE_VISIBILITY)
    return ApiResponse(data=data)


@router.delete("/{video_key}", response_model=ApiResponse[DeleteVideoData])
async def delete_video(
    video_key: ValidVideoKey,
    service: VideoCatalogServiceDep,
) -> ApiResponse[DeleteVideoData]:
    """Hard delete: permanently remove the video's S3 objects and metadata."""
    data = await service.delete_video(video_key)
    return ApiResponse(data=data)


@router.get("/{video_key}/dash/{filename}")
async def get_dash_file(
    video_key: ValidVideoKey,
    filename: ValidDashFilename,
    service: VideoStreamServiceDep,
    range_header: Annotated[str | None, Header(alias="Range")] = None,
) -> StreamingResponse:
    """Stream a DASH manifest or segment from S3 with range support."""
    return await service.stream_dash_file(video_key, filename, range_header)


@router.get("/{video_key}/assets/{filename}")
async def get_asset(
    video_key: ValidVideoKey,
    filename: ValidDashFilename,
    service: VideoStreamServiceDep,
    range_header: Annotated[str | None, Header(alias="Range")] = None,
) -> StreamingResponse:
    """Stream a thumbnail asset (poster.jpg, sprite.jpg, thumbnails.vtt) from S3."""
    return await service.stream_asset(video_key, filename, range_header)

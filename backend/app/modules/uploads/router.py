from fastapi import APIRouter, status

from app.common.deps import ValidVideoKey
from app.common.schemas import ApiResponse
from app.modules.uploads.schemas import (
    CompleteUploadRequest,
    CompleteUploadResponse,
    InitiateUploadRequest,
    InitiateUploadResponse,
    ListPartsResponse,
    SignPartsRequest,
    SignPartsResponse,
)
from app.modules.uploads.service import UploadServiceDep

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post(
    "",
    response_model=ApiResponse[InitiateUploadResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_upload(
    payload: InitiateUploadRequest,
    service: UploadServiceDep,
) -> ApiResponse[InitiateUploadResponse]:
    """Initiate a resumable multipart upload to S3."""
    data = await service.initiate_upload(payload)
    return ApiResponse(data=data)


@router.post(
    "/{video_key}/parts:sign",
    response_model=ApiResponse[SignPartsResponse],
)
async def sign_parts(
    video_key: ValidVideoKey,
    payload: SignPartsRequest,
    service: UploadServiceDep,
) -> ApiResponse[SignPartsResponse]:
    """Return short-lived presigned PUT URLs for a batch of part numbers."""
    data = await service.sign_parts(video_key, payload)
    return ApiResponse(data=data)


@router.get(
    "/{video_key}/parts",
    response_model=ApiResponse[ListPartsResponse],
)
async def list_parts(
    video_key: ValidVideoKey,
    upload_id: str,
    service: UploadServiceDep,
) -> ApiResponse[ListPartsResponse]:
    """List parts already received by S3 — used to resume an interrupted upload."""
    data = await service.list_parts(video_key, upload_id)
    return ApiResponse(data=data)


@router.post(
    "/{video_key}/complete",
    response_model=ApiResponse[CompleteUploadResponse],
)
async def complete_upload(
    video_key: ValidVideoKey,
    payload: CompleteUploadRequest,
    service: UploadServiceDep,
) -> ApiResponse[CompleteUploadResponse]:
    """Validate all parts are present and finalize the S3 multipart upload."""
    data = await service.complete_upload(video_key, payload)
    return ApiResponse(data=data)

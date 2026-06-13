from pydantic import BaseModel, Field, field_validator

from app.core.categories import get_allowed_categories, is_valid_category

# Matches the S3 multipart part-number bounds.
_MIN_PART_NUMBER = 1
_MAX_PART_NUMBER = 10_000
_MAX_PARTS_PER_BATCH = 1_000


class InitiateUploadRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=128)
    size: int = Field(gt=0, description="Total file size in bytes")
    title: str = Field(min_length=1, max_length=200)
    category: str = Field(min_length=1, max_length=50)

    @field_validator("category")
    @classmethod
    def _validate_category(cls, value: str) -> str:
        if not is_valid_category(value):
            allowed = ", ".join(get_allowed_categories())
            raise ValueError(f"category must be one of: {allowed}")
        return value


class InitiateUploadResponse(BaseModel):
    video_key: str
    upload_id: str
    part_size: int
    part_count: int


class SignPartsRequest(BaseModel):
    upload_id: str = Field(min_length=1, max_length=512)
    part_numbers: list[int] = Field(min_length=1, max_length=_MAX_PARTS_PER_BATCH)

    @field_validator("part_numbers")
    @classmethod
    def _validate_part_numbers(cls, value: list[int]) -> list[int]:
        if any(n < _MIN_PART_NUMBER or n > _MAX_PART_NUMBER for n in value):
            raise ValueError(
                f"part numbers must be between {_MIN_PART_NUMBER} and {_MAX_PART_NUMBER}"
            )
        if len(set(value)) != len(value):
            raise ValueError("part numbers must be unique")
        return value


class SignPartsResponse(BaseModel):
    urls: dict[int, str]
    expires_in: int


class UploadedPart(BaseModel):
    part_number: int
    etag: str
    size: int


class ListPartsResponse(BaseModel):
    parts: list[UploadedPart]
    part_count: int


class CompletePart(BaseModel):
    part_number: int
    etag: str = Field(min_length=1)


class CompleteUploadRequest(BaseModel):
    upload_id: str = Field(min_length=1, max_length=512)
    parts: list[CompletePart] = Field(min_length=1)

    @field_validator("parts")
    @classmethod
    def _validate_parts(cls, value: list[CompletePart]) -> list[CompletePart]:
        numbers = [p.part_number for p in value]
        if any(n < _MIN_PART_NUMBER or n > _MAX_PART_NUMBER for n in numbers):
            raise ValueError(
                f"part numbers must be between {_MIN_PART_NUMBER} and {_MAX_PART_NUMBER}"
            )
        if len(set(numbers)) != len(numbers):
            raise ValueError("part numbers must be unique")
        return value


class CompleteUploadResponse(BaseModel):
    video_key: str

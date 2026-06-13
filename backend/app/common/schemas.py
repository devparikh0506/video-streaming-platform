from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard response envelope: {success, data, error}."""

    success: bool = True
    data: T | None = None
    error: str | None = None

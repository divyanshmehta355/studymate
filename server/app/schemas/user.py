import uuid
from fastapi_users import schemas
from pydantic import Field


class UserRead(schemas.BaseUser[uuid.UUID]):
    """Schema for reading user data (returned from API)."""
    full_name: str = ""


class UserCreate(schemas.BaseUserCreate):
    """Schema for user registration."""
    full_name: str = ""


class UserUpdate(schemas.BaseUserUpdate):
    """Schema for updating user profile."""
    full_name: str | None = None

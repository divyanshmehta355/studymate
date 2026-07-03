import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.document import DocumentStatus


class DocumentOut(BaseModel):
    """Document data returned from the API."""
    id: uuid.UUID
    filename: str
    page_count: int
    status: DocumentStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    """Response after uploading a document."""
    id: uuid.UUID
    filename: str
    status: DocumentStatus
    message: str

import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.chat import MessageRole


class ConversationCreate(BaseModel):
    """Create a new conversation, optionally scoped to a document."""
    document_id: uuid.UUID | None = None
    title: str = "New Chat"


class ConversationOut(BaseModel):
    """Conversation data returned from the API."""
    id: uuid.UUID
    document_id: uuid.UUID | None
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageOut(BaseModel):
    """A single chat message."""
    id: uuid.UUID
    role: MessageRole
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    """Send a message in a conversation."""
    message: str


class SourceChunk(BaseModel):
    """A chunk of text used as context for the response."""
    content: str
    chunk_index: int


class ChatResponse(BaseModel):
    """Response from the chat endpoint."""
    answer: str
    sources: list[SourceChunk]

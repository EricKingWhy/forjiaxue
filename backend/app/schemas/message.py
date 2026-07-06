from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)
    visitor_id: str | None = Field(default=None, max_length=64)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    visitor_id: str | None
    created_at: datetime
    is_read: bool


class MessageReadUpdate(BaseModel):
    is_read: bool

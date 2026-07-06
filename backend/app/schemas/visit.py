from typing import Literal

from pydantic import BaseModel, Field


class VisitEnterRequest(BaseModel):
    ip_hash: str = Field(min_length=1, max_length=64)
    device_type: Literal["mobile", "tablet", "desktop"]
    user_agent: str | None = Field(default=None, max_length=500)
    action: Literal["enter"]


class VisitExitRequest(BaseModel):
    ip_hash: str = Field(min_length=1, max_length=64)
    action: Literal["exit"]
    screens_completed: list[str] = Field(default_factory=list)
    gesture_attempts: int = Field(default=0, ge=0)
    unlock_method: Literal["gesture", "fallback"] | None = None

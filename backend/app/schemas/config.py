from typing import Literal

from pydantic import BaseModel, Field


ParticleTier = Literal["high", "medium", "low"]


class ConfigResponse(BaseModel):
    visitor_password_enabled: bool
    bloom_enabled_default: bool
    particle_tier_default: ParticleTier
    fallback_button_text: str


class ConfigUpdate(BaseModel):
    visitor_password_enabled: bool | None = None
    visitor_password: str | None = Field(default=None, min_length=1)
    bloom_enabled_default: bool | None = None
    particle_tier_default: ParticleTier | None = None
    fallback_button_text: str | None = Field(default=None, min_length=1, max_length=100)


class PasswordVerify(BaseModel):
    password: str = Field(min_length=1)

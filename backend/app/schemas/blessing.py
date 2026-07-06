from pydantic import BaseModel, Field


class BlessingResponse(BaseModel):
    paragraphs: list[str]


class BlessingUpdate(BaseModel):
    paragraphs: list[str] = Field(min_length=1)

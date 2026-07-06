from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MusicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    music_url: str
    original_filename: str
    is_active: bool
    created_at: datetime

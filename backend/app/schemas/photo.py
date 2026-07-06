from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PhotoUploadRequest(BaseModel):
    is_main_photo: bool = False
    display_order: int = 0


class PhotoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    webp_url: str
    thumbnail_url: str
    particle_map_url: str
    display_order: int
    is_main_photo: bool
    created_at: datetime

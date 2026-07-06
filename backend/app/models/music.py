from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class MusicTrack(Base):
    __tablename__ = "music_track"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    music_path: Mapped[str] = mapped_column(String(500), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

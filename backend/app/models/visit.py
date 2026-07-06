from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class VisitEvent(Base):
    __tablename__ = "visit_event"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ip_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    device_type: Mapped[str] = mapped_column(String(50), nullable=False)
    user_agent: Mapped[str | None] = mapped_column(String(500))
    entered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    exited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    screens_completed: Mapped[list[str]] = mapped_column(
        JSON, default=list, nullable=False
    )
    gesture_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unlock_method: Mapped[str | None] = mapped_column(String(20))

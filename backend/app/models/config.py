from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AppConfig(Base):
    __tablename__ = "app_config"

    id: Mapped[int] = mapped_column(primary_key=True)
    visitor_password_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    visitor_password_hash: Mapped[str | None] = mapped_column(String(64))
    bloom_enabled_default: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    particle_tier_default: Mapped[str] = mapped_column(
        String(10), default="medium", nullable=False
    )
    fallback_button_text: Mapped[str] = mapped_column(
        String(100), default="识别不到？点击这里继续", nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

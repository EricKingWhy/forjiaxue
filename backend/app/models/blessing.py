from datetime import datetime

from sqlalchemy import JSON, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BlessingText(Base):
    __tablename__ = "blessing_text"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    paragraphs: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

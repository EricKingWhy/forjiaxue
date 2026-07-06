from pathlib import Path
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

connect_args = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

DEFAULT_BLESSING_PARAGRAPHS = [
    "愿往后的每一天，都有温柔与惊喜相伴。",
    "愿我们的故事，在平凡的日子里继续闪闪发光。",
]


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_database() -> None:
    from app.models.blessing import BlessingText
    from app.models.config import AppConfig
    from app.models.message import SecretMessage  # noqa: F401
    from app.models.music import MusicTrack  # noqa: F401
    from app.models.photo import Photo  # noqa: F401
    from app.models.visit import VisitEvent  # noqa: F401

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        if db.get(AppConfig, 1) is None:
            db.add(AppConfig(id=1))
        if db.query(BlessingText).first() is None:
            db.add(
                BlessingText(
                    content="\n\n".join(DEFAULT_BLESSING_PARAGRAPHS),
                    paragraphs=DEFAULT_BLESSING_PARAGRAPHS,
                )
            )
        db.commit()

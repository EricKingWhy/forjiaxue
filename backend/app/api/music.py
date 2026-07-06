from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.music import MusicTrack


router = APIRouter(prefix="/api", tags=["music"])


@router.get("/music")
def get_active_music(db: Session = Depends(get_db)) -> dict[str, object] | None:
    track = db.scalar(
        select(MusicTrack)
        .where(MusicTrack.is_active.is_(True))
        .order_by(MusicTrack.created_at.desc(), MusicTrack.id.desc())
    )
    if track is None:
        return None
    return {
        "id": track.id,
        "music_url": f"/{track.music_path.lstrip('/')}",
        "original_filename": track.original_filename,
        "is_active": track.is_active,
    }

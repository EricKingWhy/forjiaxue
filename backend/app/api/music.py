from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models.music import MusicTrack
from app.services.image_processor import validate_upload


router = APIRouter(prefix="/api", tags=["music"])
UPLOADS_ROOT = Path(__file__).resolve().parents[2] / "uploads"


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


@router.post(
    "/admin/music",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def upload_music(
    file: UploadFile = File(...), db: Session = Depends(get_db)
) -> dict[str, object]:
    filename = file.filename or "upload"
    music_data = await file.read()
    try:
        validate_upload(filename, len(music_data), "music")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    suffix = Path(filename).suffix.lower()
    output_path = UPLOADS_ROOT / "music" / f"{uuid4().hex}{suffix}"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(music_data)

    db.query(MusicTrack).filter(MusicTrack.is_active.is_(True)).update(
        {MusicTrack.is_active: False}
    )
    track = MusicTrack(
        original_filename=filename,
        music_path=f"uploads/music/{output_path.name}",
        is_active=True,
    )
    db.add(track)
    db.commit()
    db.refresh(track)
    return {
        "id": track.id,
        "music_url": f"/{track.music_path}",
        "original_filename": track.original_filename,
        "is_active": track.is_active,
    }

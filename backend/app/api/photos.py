from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from PIL import UnidentifiedImageError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models.photo import Photo
from app.schemas.photo import PhotoUpdate
from app.services.image_processor import process_photo


router = APIRouter(prefix="/api", tags=["photos"])
UPLOADS_ROOT = Path(__file__).resolve().parents[2] / "uploads"


def _public_url(path: str) -> str:
    return f"/{path.lstrip('/')}"


@router.get("/photos")
def get_photos(db: Session = Depends(get_db)) -> dict[str, object]:
    photos = db.scalars(
        select(Photo).order_by(Photo.display_order.asc(), Photo.id.asc())
    ).all()
    main = next((photo for photo in photos if photo.is_main_photo), None)
    wall = [photo for photo in photos if not photo.is_main_photo]

    return {
        "main_photo": (
            {
                "id": main.id,
                "webp_url": _public_url(main.webp_path),
                "particle_map_url": _public_url(main.particle_map_path),
                "is_main_photo": True,
            }
            if main
            else None
        ),
        "wall_photos": [
            {
                "id": photo.id,
                "webp_url": _public_url(photo.webp_path),
                "thumbnail_url": _public_url(photo.thumbnail_path),
                "display_order": photo.display_order,
            }
            for photo in wall
        ],
    }


@router.post(
    "/admin/photos",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def upload_photo(
    file: UploadFile = File(...),
    is_main_photo: bool = Form(False),
    display_order: int = Form(0),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    filename = file.filename or "upload"
    image_data = await file.read()
    try:
        outputs = process_photo(image_data, filename, UPLOADS_ROOT)
    except (ValueError, UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if is_main_photo:
        db.query(Photo).filter(Photo.is_main_photo.is_(True)).update(
            {Photo.is_main_photo: False}
        )

    paths = {
        name: f"uploads/{path.parent.name}/{path.name}"
        for name, path in outputs.items()
    }
    photo = Photo(
        original_filename=filename,
        original_path=paths["original"],
        webp_path=paths["webp"],
        thumbnail_path=paths["thumbnail"],
        particle_map_path=paths["particle_map"],
        display_order=display_order,
        is_main_photo=is_main_photo,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return {
        "id": photo.id,
        "original_filename": photo.original_filename,
        "webp_url": _public_url(photo.webp_path),
        "thumbnail_url": _public_url(photo.thumbnail_path),
        "particle_map_url": _public_url(photo.particle_map_path),
        "display_order": photo.display_order,
        "is_main_photo": photo.is_main_photo,
        "created_at": photo.created_at,
    }


@router.delete("/admin/photos/{photo_id}", dependencies=[Depends(require_admin)])
def delete_photo(
    photo_id: int, db: Session = Depends(get_db)
) -> dict[str, bool]:
    photo = db.get(Photo, photo_id)
    if photo is None:
        raise HTTPException(status_code=404, detail="Photo not found")

    for stored_path in (
        photo.original_path,
        photo.webp_path,
        photo.thumbnail_path,
        photo.particle_map_path,
    ):
        relative_path = Path(stored_path)
        file_path = UPLOADS_ROOT / relative_path.parent.name / relative_path.name
        file_path.unlink(missing_ok=True)

    db.delete(photo)
    db.commit()
    return {"deleted": True}


@router.patch("/admin/photos/{photo_id}", dependencies=[Depends(require_admin)])
def update_photo(
    photo_id: int,
    payload: PhotoUpdate,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    photo = db.get(Photo, photo_id)
    if photo is None:
        raise HTTPException(status_code=404, detail="Photo not found")

    if payload.is_main_photo is True:
        db.query(Photo).filter(Photo.id != photo_id).update(
            {Photo.is_main_photo: False}
        )
    if payload.is_main_photo is not None:
        photo.is_main_photo = payload.is_main_photo
    if payload.display_order is not None:
        photo.display_order = payload.display_order
    db.commit()
    db.refresh(photo)
    return {
        "id": photo.id,
        "display_order": photo.display_order,
        "is_main_photo": photo.is_main_photo,
    }

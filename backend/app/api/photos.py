from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.photo import Photo


router = APIRouter(prefix="/api", tags=["photos"])


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

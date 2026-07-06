from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models.blessing import BlessingText
from app.schemas.blessing import BlessingResponse, BlessingUpdate


router = APIRouter(prefix="/api", tags=["blessing"])


@router.get("/blessing", response_model=BlessingResponse)
def get_blessing(db: Session = Depends(get_db)) -> BlessingText:
    blessing = db.scalar(select(BlessingText).order_by(BlessingText.id.asc()))
    if blessing is None:
        raise HTTPException(status_code=500, detail="Blessing text is missing")
    return blessing


@router.put("/admin/blessing", dependencies=[Depends(require_admin)])
def update_blessing(
    payload: BlessingUpdate, db: Session = Depends(get_db)
) -> dict[str, object]:
    blessing = db.scalar(select(BlessingText).order_by(BlessingText.id.asc()))
    if blessing is None:
        raise HTTPException(status_code=500, detail="Blessing text is missing")
    blessing.paragraphs = payload.paragraphs
    blessing.content = "\n\n".join(payload.paragraphs)
    db.commit()
    db.refresh(blessing)
    return {
        "id": blessing.id,
        "paragraphs": blessing.paragraphs,
        "updated_at": blessing.updated_at,
    }

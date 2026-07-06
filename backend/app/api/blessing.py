from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.blessing import BlessingText
from app.schemas.blessing import BlessingResponse


router = APIRouter(prefix="/api", tags=["blessing"])


@router.get("/blessing", response_model=BlessingResponse)
def get_blessing(db: Session = Depends(get_db)) -> BlessingText:
    blessing = db.scalar(select(BlessingText).order_by(BlessingText.id.asc()))
    if blessing is None:
        raise HTTPException(status_code=500, detail="Blessing text is missing")
    return blessing

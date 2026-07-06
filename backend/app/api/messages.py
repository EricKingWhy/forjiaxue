from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.message import SecretMessage
from app.schemas.message import MessageCreate


router = APIRouter(prefix="/api", tags=["messages"])


@router.post("/messages", status_code=status.HTTP_201_CREATED)
def create_message(
    payload: MessageCreate, db: Session = Depends(get_db)
) -> dict[str, object]:
    message = SecretMessage(content=payload.content, visitor_id=payload.visitor_id)
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"id": message.id, "created_at": message.created_at}

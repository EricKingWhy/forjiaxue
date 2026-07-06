from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models.message import SecretMessage
from app.schemas.message import MessageCreate, MessageReadUpdate, MessageResponse


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


@router.get("/admin/messages", dependencies=[Depends(require_admin)])
def get_admin_messages(db: Session = Depends(get_db)) -> dict[str, object]:
    messages = db.scalars(
        select(SecretMessage).order_by(SecretMessage.created_at.desc())
    ).all()
    unread_count = db.scalar(
        select(func.count()).select_from(SecretMessage).where(
            SecretMessage.is_read.is_(False)
        )
    )
    return {
        "messages": [MessageResponse.model_validate(message) for message in messages],
        "unread_count": unread_count or 0,
    }


@router.patch(
    "/admin/messages/{message_id}", dependencies=[Depends(require_admin)]
)
def update_message_read_status(
    message_id: int,
    payload: MessageReadUpdate,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    message = db.get(SecretMessage, message_id)
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    message.is_read = payload.is_read
    db.commit()
    return {"id": message.id, "is_read": message.is_read}

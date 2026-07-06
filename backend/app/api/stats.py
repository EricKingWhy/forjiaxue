import hashlib
import re
from datetime import datetime

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models.visit import VisitEvent
from app.schemas.visit import VisitEnterRequest, VisitExitRequest
from app.services.stats import build_admin_stats


router = APIRouter(prefix="/api", tags=["statistics"])


def _normalize_ip_hash(value: str) -> str:
    if re.fullmatch(r"[0-9a-fA-F]{64}", value):
        return value.lower()
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


@router.post("/stats/visit")
def record_visit(
    payload: VisitEnterRequest | VisitExitRequest = Body(discriminator="action"),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    ip_hash = _normalize_ip_hash(payload.ip_hash)
    if isinstance(payload, VisitEnterRequest):
        event = VisitEvent(
            ip_hash=ip_hash,
            device_type=payload.device_type,
            user_agent=payload.user_agent,
        )
        db.add(event)
    else:
        event = db.scalar(
            select(VisitEvent)
            .where(
                VisitEvent.ip_hash == ip_hash,
                VisitEvent.exited_at.is_(None),
            )
            .order_by(VisitEvent.entered_at.desc(), VisitEvent.id.desc())
        )
        if event is None:
            raise HTTPException(status_code=404, detail="Open visit event not found")
        event.exited_at = datetime.now(event.entered_at.tzinfo)
        event.duration_seconds = max(
            0, int((event.exited_at - event.entered_at).total_seconds())
        )
        event.screens_completed = payload.screens_completed
        event.gesture_attempts = payload.gesture_attempts
        event.unlock_method = payload.unlock_method
    db.commit()
    db.refresh(event)
    return {"event_id": event.id}


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
def get_admin_stats(db: Session = Depends(get_db)) -> dict[str, object]:
    return build_admin_stats(db)

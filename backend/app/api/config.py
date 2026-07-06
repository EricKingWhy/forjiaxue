from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.config import AppConfig
from app.schemas.config import ConfigResponse, PasswordVerify
from app.services.auth import verify_password


router = APIRouter(prefix="/api", tags=["config"])


@router.get("/config", response_model=ConfigResponse)
def get_config(db: Session = Depends(get_db)) -> AppConfig:
    config = db.get(AppConfig, 1)
    if config is None:
        raise HTTPException(status_code=500, detail="Application config is missing")
    return config


@router.post("/config/verify-password")
def verify_visitor_password(
    payload: PasswordVerify, db: Session = Depends(get_db)
) -> dict[str, object]:
    config = db.get(AppConfig, 1)
    if config is None:
        raise HTTPException(status_code=500, detail="Application config is missing")
    if not config.visitor_password_enabled:
        return {"valid": True}
    valid = verify_password(payload.password, config.visitor_password_hash)
    if valid:
        return {"valid": True}
    return {"valid": False, "error": "密码错误"}

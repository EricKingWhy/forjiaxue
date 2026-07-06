from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import hash_password, require_admin
from app.database import get_db
from app.models.config import AppConfig
from app.schemas.config import ConfigResponse, ConfigUpdate, PasswordVerify
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


@router.put("/admin/config", dependencies=[Depends(require_admin)])
def update_config(
    payload: ConfigUpdate, db: Session = Depends(get_db)
) -> dict[str, object]:
    config = db.get(AppConfig, 1)
    if config is None:
        raise HTTPException(status_code=500, detail="Application config is missing")

    updates = payload.model_dump(exclude_unset=True)
    visitor_password = updates.pop("visitor_password", None)
    if visitor_password is not None:
        config.visitor_password_hash = hash_password(visitor_password)
    for field, value in updates.items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)
    return {
        "visitor_password_enabled": config.visitor_password_enabled,
        "bloom_enabled_default": config.bloom_enabled_default,
        "particle_tier_default": config.particle_tier_default,
        "fallback_button_text": config.fallback_button_text,
        "updated_at": config.updated_at,
    }

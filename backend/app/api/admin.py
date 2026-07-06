from fastapi import APIRouter, HTTPException

from app.core.security import create_admin_token, verify_admin_password
from app.schemas.config import PasswordVerify


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/auth")
def authenticate_admin(payload: PasswordVerify) -> dict[str, str]:
    if not verify_admin_password(payload.password):
        raise HTTPException(status_code=403, detail="Invalid admin password")
    token, expires_at = create_admin_token()
    return {"token": token, "expires_at": expires_at.isoformat()}

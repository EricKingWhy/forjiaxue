import hashlib
import hmac
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings


bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        return False
    return hmac.compare_digest(hash_password(password), password_hash)


def verify_admin_password(password: str) -> bool:
    return hmac.compare_digest(
        hash_password(password), hash_password(settings.ADMIN_PASSWORD)
    )


def create_admin_token() -> tuple[str, datetime]:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ADMIN_TOKEN_EXPIRE_MINUTES
    )
    token = jwt.encode(
        {"sub": "admin", "exp": expires_at},
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    return token, expires_at


def decode_admin_token(token: str) -> dict[str, object]:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
) -> dict[str, object]:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Admin token required")
    try:
        payload = decode_admin_token(credentials.credentials)
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid admin token") from exc
    if payload.get("sub") != "admin":
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return payload

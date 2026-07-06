import hashlib
import hmac


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        return False
    candidate_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return hmac.compare_digest(candidate_hash, password_hash)

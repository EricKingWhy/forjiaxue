import hashlib
import unittest

from fastapi.testclient import TestClient

from app.main import app


class SecurityTests(unittest.TestCase):
    def test_sha256_hash_and_admin_password_verification(self) -> None:
        from app.core.security import (
            hash_password,
            verify_admin_password,
            verify_password,
        )

        digest = hash_password("secret")
        self.assertEqual(hashlib.sha256(b"secret").hexdigest(), digest)
        self.assertTrue(verify_password("secret", digest))
        self.assertFalse(verify_password("wrong", digest))
        self.assertTrue(verify_admin_password("admin123"))
        self.assertFalse(verify_admin_password("wrong"))

    def test_admin_auth_returns_decodable_jwt(self) -> None:
        from app.core.security import decode_admin_token

        client = TestClient(app)
        response = client.post("/api/admin/auth", json={"password": "admin123"})
        denied = client.post("/api/admin/auth", json={"password": "wrong"})

        self.assertEqual(200, response.status_code)
        self.assertEqual("admin", decode_admin_token(response.json()["token"])["sub"])
        self.assertIn("expires_at", response.json())
        self.assertEqual(403, denied.status_code)


if __name__ == "__main__":
    unittest.main()

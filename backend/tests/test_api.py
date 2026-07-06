import hashlib
import unittest

from fastapi.testclient import TestClient

from app.database import SessionLocal, initialize_database
from app.main import app
from app.models.photo import Photo
from app.models.music import MusicTrack
from app.models.config import AppConfig
from app.models.message import SecretMessage
from app.models.visit import VisitEvent


class PublicApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        initialize_database()
        cls.client = TestClient(app)

    def test_get_photos_returns_main_and_ordered_wall_photos(self) -> None:
        with SessionLocal() as session:
            session.query(Photo).delete()
            session.add_all(
                [
                    Photo(
                        original_filename="main.jpg",
                        original_path="uploads/original/main.jpg",
                        webp_path="uploads/webp/main.webp",
                        thumbnail_path="uploads/thumb/main.webp",
                        particle_map_path="uploads/particle_map/main.json",
                        display_order=0,
                        is_main_photo=True,
                    ),
                    Photo(
                        original_filename="wall.jpg",
                        original_path="uploads/original/wall.jpg",
                        webp_path="uploads/webp/wall.webp",
                        thumbnail_path="uploads/thumb/wall.webp",
                        particle_map_path="uploads/particle_map/wall.json",
                        display_order=2,
                        is_main_photo=False,
                    ),
                ]
            )
            session.commit()

        response = self.client.get("/api/photos")

        self.assertEqual(200, response.status_code)
        payload = response.json()
        self.assertEqual("/uploads/webp/main.webp", payload["main_photo"]["webp_url"])
        self.assertEqual(1, len(payload["wall_photos"]))
        self.assertEqual(2, payload["wall_photos"][0]["display_order"])

    def test_get_music_returns_active_track(self) -> None:
        with SessionLocal() as session:
            session.query(MusicTrack).delete()
            session.add_all(
                [
                    MusicTrack(
                        original_filename="old.mp3",
                        music_path="uploads/music/old.mp3",
                        is_active=False,
                    ),
                    MusicTrack(
                        original_filename="active.mp3",
                        music_path="uploads/music/active.mp3",
                        is_active=True,
                    ),
                ]
            )
            session.commit()

        response = self.client.get("/api/music")

        self.assertEqual(200, response.status_code)
        self.assertEqual("/uploads/music/active.mp3", response.json()["music_url"])

    def test_get_config_returns_public_settings(self) -> None:
        response = self.client.get("/api/config")

        self.assertEqual(200, response.status_code)
        self.assertEqual(
            {
                "visitor_password_enabled": True,
                "bloom_enabled_default": True,
                "particle_tier_default": "medium",
                "fallback_button_text": "识别不到？点击这里继续",
            },
            response.json(),
        )

    def test_verify_visitor_password_returns_validity(self) -> None:
        with SessionLocal() as session:
            config = session.get(AppConfig, 1)
            assert config is not None
            config.visitor_password_enabled = True
            config.visitor_password_hash = hashlib.sha256(b"test").hexdigest()
            session.commit()

        valid = self.client.post(
            "/api/config/verify-password", json={"password": "test"}
        )
        invalid = self.client.post(
            "/api/config/verify-password", json={"password": "wrong"}
        )

        self.assertEqual({"valid": True}, valid.json())
        self.assertEqual(False, invalid.json()["valid"])

    def test_get_blessing_returns_paragraphs(self) -> None:
        response = self.client.get("/api/blessing")

        self.assertEqual(200, response.status_code)
        self.assertTrue(response.json()["paragraphs"])

    def test_post_message_creates_secret_message(self) -> None:
        with SessionLocal() as session:
            session.query(SecretMessage).delete()
            session.commit()

        response = self.client.post("/api/messages", json={"content": "test"})

        self.assertEqual(201, response.status_code)
        self.assertIn("id", response.json())
        self.assertIn("created_at", response.json())
        with SessionLocal() as session:
            self.assertEqual(1, session.query(SecretMessage).count())

    def test_enter_visit_creates_event_with_hashed_identifier(self) -> None:
        with SessionLocal() as session:
            session.query(VisitEvent).delete()
            session.commit()

        response = self.client.post(
            "/api/stats/visit",
            json={
                "ip_hash": "abc",
                "device_type": "mobile",
                "user_agent": "Safari",
                "action": "enter",
            },
        )

        self.assertEqual(200, response.status_code)
        with SessionLocal() as session:
            event = session.get(VisitEvent, response.json()["event_id"])
            assert event is not None
            self.assertEqual(hashlib.sha256(b"abc").hexdigest(), event.ip_hash)
            self.assertEqual("mobile", event.device_type)

    def test_exit_visit_updates_latest_open_event(self) -> None:
        with SessionLocal() as session:
            session.query(VisitEvent).delete()
            session.commit()

        entered = self.client.post(
            "/api/stats/visit",
            json={
                "ip_hash": "abc",
                "device_type": "mobile",
                "action": "enter",
            },
        )
        exited = self.client.post(
            "/api/stats/visit",
            json={
                "ip_hash": "abc",
                "action": "exit",
                "screens_completed": ["entry"],
                "gesture_attempts": 1,
                "unlock_method": "gesture",
            },
        )

        self.assertEqual(200, exited.status_code)
        self.assertEqual(entered.json()["event_id"], exited.json()["event_id"])
        with SessionLocal() as session:
            event = session.get(VisitEvent, exited.json()["event_id"])
            assert event is not None
            self.assertIsNotNone(event.exited_at)
            self.assertEqual(["entry"], event.screens_completed)
            self.assertGreaterEqual(event.duration_seconds or 0, 0)


class AdminApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        initialize_database()
        cls.client = TestClient(app)
        login = cls.client.post("/api/admin/auth", json={"password": "admin123"})
        cls.headers = {"Authorization": f"Bearer {login.json()['token']}"}

    def test_admin_stats_requires_token_and_returns_aggregates(self) -> None:
        with SessionLocal() as session:
            session.query(VisitEvent).delete()
            session.add_all(
                [
                    VisitEvent(
                        ip_hash="a" * 64,
                        device_type="mobile",
                        duration_seconds=120,
                        screens_completed=["entry"],
                        unlock_method="gesture",
                    ),
                    VisitEvent(
                        ip_hash="b" * 64,
                        device_type="desktop",
                        duration_seconds=60,
                        screens_completed=["entry", "particles"],
                        unlock_method="fallback",
                    ),
                ]
            )
            session.commit()

        denied = self.client.get("/api/admin/stats")
        response = self.client.get("/api/admin/stats", headers=self.headers)

        self.assertEqual(401, denied.status_code)
        self.assertEqual(200, response.status_code)
        payload = response.json()
        self.assertEqual(2, payload["total_visits"])
        self.assertEqual({"mobile": 1, "desktop": 1}, payload["device_breakdown"])
        self.assertEqual(2, len(payload["recent_visits"]))

    def test_admin_messages_returns_messages_and_unread_count(self) -> None:
        with SessionLocal() as session:
            session.query(SecretMessage).delete()
            session.add_all(
                [
                    SecretMessage(content="unread", is_read=False),
                    SecretMessage(content="read", is_read=True),
                ]
            )
            session.commit()

        denied = self.client.get("/api/admin/messages")
        response = self.client.get("/api/admin/messages", headers=self.headers)

        self.assertEqual(401, denied.status_code)
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, response.json()["unread_count"])
        self.assertEqual(2, len(response.json()["messages"]))

    def test_admin_can_mark_message_read(self) -> None:
        with SessionLocal() as session:
            message = SecretMessage(content="mark me", is_read=False)
            session.add(message)
            session.commit()
            session.refresh(message)
            message_id = message.id

        denied = self.client.patch(
            f"/api/admin/messages/{message_id}", json={"is_read": True}
        )
        response = self.client.patch(
            f"/api/admin/messages/{message_id}",
            json={"is_read": True},
            headers=self.headers,
        )

        self.assertEqual(401, denied.status_code)
        self.assertEqual(200, response.status_code)
        self.assertEqual({"id": message_id, "is_read": True}, response.json())


if __name__ == "__main__":
    unittest.main()

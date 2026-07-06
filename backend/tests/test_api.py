import hashlib
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image

from app.database import SessionLocal, initialize_database
from app.main import app
from app.models.photo import Photo
from app.models.music import MusicTrack
from app.models.config import AppConfig
from app.models.blessing import BlessingText
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
        with SessionLocal() as session:
            config = session.get(AppConfig, 1)
            assert config is not None
            config.visitor_password_enabled = True
            config.bloom_enabled_default = True
            config.particle_tier_default = "medium"
            config.fallback_button_text = "识别不到？点击这里继续"
            session.commit()

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

    def test_uploads_are_served_as_static_files(self) -> None:
        test_file = Path("uploads/webp/test-static.webp")
        test_file.parent.mkdir(parents=True, exist_ok=True)
        test_file.write_bytes(b"static-content")
        try:
            response = self.client.get("/uploads/webp/test-static.webp")
        finally:
            test_file.unlink(missing_ok=True)

        self.assertEqual(200, response.status_code)
        self.assertEqual(b"static-content", response.content)


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

    def test_admin_photo_upload_processes_and_persists_photo(self) -> None:
        image_buffer = BytesIO()
        Image.new("RGB", (8, 8), "orange").save(image_buffer, format="JPEG")
        with SessionLocal() as session:
            session.query(Photo).delete()
            session.commit()

        with TemporaryDirectory() as temporary_directory:
            uploads_root = Path(temporary_directory)
            with patch("app.api.photos.UPLOADS_ROOT", uploads_root):
                response = self.client.post(
                    "/api/admin/photos",
                    files={"file": ("photo.jpg", image_buffer.getvalue(), "image/jpeg")},
                    data={"is_main_photo": "true", "display_order": "3"},
                    headers=self.headers,
                )

            self.assertEqual(201, response.status_code)
            self.assertTrue(any((uploads_root / "webp").iterdir()))
            self.assertTrue(any((uploads_root / "thumb").iterdir()))
            self.assertTrue(any((uploads_root / "particle_map").iterdir()))

        with SessionLocal() as session:
            photo = session.get(Photo, response.json()["id"])
            assert photo is not None
            self.assertTrue(photo.is_main_photo)
            self.assertEqual(3, photo.display_order)

    def test_admin_photo_delete_removes_database_row_and_files(self) -> None:
        with TemporaryDirectory() as temporary_directory:
            uploads_root = Path(temporary_directory)
            paths = {
                "original": uploads_root / "original" / "photo.jpg",
                "webp": uploads_root / "webp" / "photo.webp",
                "thumbnail": uploads_root / "thumb" / "photo.webp",
                "particle_map": uploads_root / "particle_map" / "photo.json",
            }
            for path in paths.values():
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"test")

            with SessionLocal() as session:
                photo = Photo(
                    original_filename="photo.jpg",
                    original_path="uploads/original/photo.jpg",
                    webp_path="uploads/webp/photo.webp",
                    thumbnail_path="uploads/thumb/photo.webp",
                    particle_map_path="uploads/particle_map/photo.json",
                )
                session.add(photo)
                session.commit()
                session.refresh(photo)
                photo_id = photo.id

            with patch("app.api.photos.UPLOADS_ROOT", uploads_root):
                response = self.client.delete(
                    f"/api/admin/photos/{photo_id}", headers=self.headers
                )

            self.assertEqual({"deleted": True}, response.json())
            self.assertTrue(all(not path.exists() for path in paths.values()))
            with SessionLocal() as session:
                self.assertIsNone(session.get(Photo, photo_id))

    def test_admin_photo_patch_updates_order_and_main_status(self) -> None:
        with SessionLocal() as session:
            session.query(Photo).delete()
            old_main = Photo(
                original_filename="old.jpg",
                original_path="uploads/original/old.jpg",
                webp_path="uploads/webp/old.webp",
                thumbnail_path="uploads/thumb/old.webp",
                particle_map_path="uploads/particle_map/old.json",
                is_main_photo=True,
            )
            target = Photo(
                original_filename="target.jpg",
                original_path="uploads/original/target.jpg",
                webp_path="uploads/webp/target.webp",
                thumbnail_path="uploads/thumb/target.webp",
                particle_map_path="uploads/particle_map/target.json",
            )
            session.add_all([old_main, target])
            session.commit()
            session.refresh(target)
            target_id = target.id

        response = self.client.patch(
            f"/api/admin/photos/{target_id}",
            json={"is_main_photo": True, "display_order": 5},
            headers=self.headers,
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(5, response.json()["display_order"])
        self.assertTrue(response.json()["is_main_photo"])
        with SessionLocal() as session:
            self.assertEqual(1, session.query(Photo).filter_by(is_main_photo=True).count())

    def test_admin_music_upload_saves_file_and_deactivates_previous(self) -> None:
        with SessionLocal() as session:
            session.query(MusicTrack).delete()
            session.add(
                MusicTrack(
                    original_filename="old.mp3",
                    music_path="uploads/music/old.mp3",
                    is_active=True,
                )
            )
            session.commit()

        with TemporaryDirectory() as temporary_directory:
            uploads_root = Path(temporary_directory)
            with patch("app.api.music.UPLOADS_ROOT", uploads_root):
                response = self.client.post(
                    "/api/admin/music",
                    files={"file": ("new.mp3", b"small audio", "audio/mpeg")},
                    headers=self.headers,
                )

            self.assertEqual(201, response.status_code)
            self.assertTrue(any((uploads_root / "music").iterdir()))

        with SessionLocal() as session:
            tracks = session.query(MusicTrack).order_by(MusicTrack.id).all()
            self.assertEqual(2, len(tracks))
            self.assertFalse(tracks[0].is_active)
            self.assertTrue(tracks[1].is_active)

    def test_admin_can_update_blessing_paragraphs(self) -> None:
        denied = self.client.put(
            "/api/admin/blessing", json={"paragraphs": ["new blessing"]}
        )
        response = self.client.put(
            "/api/admin/blessing",
            json={"paragraphs": ["first", "second"]},
            headers=self.headers,
        )

        self.assertEqual(401, denied.status_code)
        self.assertEqual(200, response.status_code)
        self.assertEqual(["first", "second"], response.json()["paragraphs"])
        with SessionLocal() as session:
            blessing = session.query(BlessingText).first()
            assert blessing is not None
            self.assertEqual("first\n\nsecond", blessing.content)

    def test_admin_can_update_app_config_and_hash_password(self) -> None:
        response = self.client.put(
            "/api/admin/config",
            json={
                "visitor_password_enabled": False,
                "visitor_password": "new-password",
                "bloom_enabled_default": False,
                "particle_tier_default": "low",
                "fallback_button_text": "continue",
            },
            headers=self.headers,
        )

        self.assertEqual(200, response.status_code)
        self.assertFalse(response.json()["visitor_password_enabled"])
        self.assertEqual("low", response.json()["particle_tier_default"])
        with SessionLocal() as session:
            config = session.get(AppConfig, 1)
            assert config is not None
            self.assertEqual(
                hashlib.sha256(b"new-password").hexdigest(),
                config.visitor_password_hash,
            )


if __name__ == "__main__":
    unittest.main()

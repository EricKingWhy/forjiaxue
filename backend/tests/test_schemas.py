from datetime import datetime, timezone
import unittest

from pydantic import ValidationError


class SchemaTests(unittest.TestCase):
    def test_photo_schemas_define_response_and_upload_defaults(self) -> None:
        from app.schemas.photo import PhotoResponse, PhotoUploadRequest

        upload = PhotoUploadRequest()
        self.assertEqual(0, upload.display_order)
        self.assertFalse(upload.is_main_photo)

        response = PhotoResponse(
            id=1,
            original_filename="photo.jpg",
            webp_url="/uploads/webp/photo.webp",
            thumbnail_url="/uploads/thumb/photo.webp",
            particle_map_url="/uploads/particle_map/photo.json",
            display_order=1,
            is_main_photo=True,
            created_at=datetime.now(timezone.utc),
        )
        self.assertTrue(response.is_main_photo)

    def test_music_response_schema(self) -> None:
        from app.schemas.music import MusicResponse

        response = MusicResponse(
            id=1,
            music_url="/uploads/music/song.mp3",
            original_filename="song.mp3",
            is_active=True,
            created_at=datetime.now(timezone.utc),
        )
        self.assertTrue(response.is_active)

    def test_blessing_schemas_require_nonempty_paragraphs(self) -> None:
        from app.schemas.blessing import BlessingResponse, BlessingUpdate

        update = BlessingUpdate(paragraphs=["first", "second"])
        response = BlessingResponse(paragraphs=update.paragraphs)
        self.assertEqual(["first", "second"], response.paragraphs)

        with self.assertRaises(ValidationError):
            BlessingUpdate(paragraphs=[])

    def test_visit_schemas_distinguish_enter_and_exit(self) -> None:
        from app.schemas.visit import VisitEnterRequest, VisitExitRequest

        enter = VisitEnterRequest(
            ip_hash="abc", device_type="mobile", user_agent="Safari", action="enter"
        )
        self.assertEqual("mobile", enter.device_type)

        exit_request = VisitExitRequest(
            ip_hash="abc",
            action="exit",
            screens_completed=["entry"],
            gesture_attempts=2,
            unlock_method="gesture",
        )
        self.assertEqual(["entry"], exit_request.screens_completed)

        with self.assertRaises(ValidationError):
            VisitEnterRequest(ip_hash="abc", device_type="phone", action="enter")

    def test_message_schemas_enforce_content_limit(self) -> None:
        from app.schemas.message import MessageCreate, MessageResponse

        create = MessageCreate(content="hello", visitor_id="abc")
        response = MessageResponse(
            id=1,
            content=create.content,
            visitor_id=create.visitor_id,
            created_at=datetime.now(timezone.utc),
            is_read=False,
        )
        self.assertFalse(response.is_read)

        with self.assertRaises(ValidationError):
            MessageCreate(content="x" * 5001)

    def test_config_schemas_validate_particle_tier(self) -> None:
        from app.schemas.config import ConfigResponse, ConfigUpdate, PasswordVerify

        response = ConfigResponse(
            visitor_password_enabled=True,
            bloom_enabled_default=True,
            particle_tier_default="medium",
            fallback_button_text="continue",
        )
        self.assertEqual("medium", response.particle_tier_default)
        self.assertEqual(False, ConfigUpdate(visitor_password_enabled=False).visitor_password_enabled)
        self.assertEqual("secret", PasswordVerify(password="secret").password)

        with self.assertRaises(ValidationError):
            ConfigUpdate(particle_tier_default="ultra")


if __name__ == "__main__":
    unittest.main()

import unittest

from sqlalchemy import inspect

from app.database import Base, engine


class ModelTests(unittest.TestCase):
    def assert_table_columns(self, table_name: str, expected: set[str]) -> None:
        Base.metadata.create_all(bind=engine)
        columns = {column["name"] for column in inspect(engine).get_columns(table_name)}
        self.assertEqual(expected, columns)

    def test_photo_table_has_required_columns(self) -> None:
        from app.models.photo import Photo  # noqa: F401

        self.assert_table_columns(
            "photo",
            {
                "id",
                "original_filename",
                "original_path",
                "webp_path",
                "thumbnail_path",
                "particle_map_path",
                "display_order",
                "is_main_photo",
                "created_at",
                "updated_at",
            },
        )

    def test_music_track_table_has_required_columns(self) -> None:
        from app.models.music import MusicTrack  # noqa: F401

        self.assert_table_columns(
            "music_track",
            {
                "id",
                "original_filename",
                "music_path",
                "is_active",
                "created_at",
            },
        )

    def test_blessing_text_table_has_required_columns(self) -> None:
        from app.models.blessing import BlessingText  # noqa: F401

        self.assert_table_columns(
            "blessing_text",
            {"id", "content", "paragraphs", "updated_at"},
        )

    def test_visit_event_table_has_required_columns(self) -> None:
        from app.models.visit import VisitEvent  # noqa: F401

        self.assert_table_columns(
            "visit_event",
            {
                "id",
                "ip_hash",
                "device_type",
                "user_agent",
                "entered_at",
                "exited_at",
                "duration_seconds",
                "screens_completed",
                "gesture_attempts",
                "unlock_method",
            },
        )

    def test_secret_message_table_has_required_columns(self) -> None:
        from app.models.message import SecretMessage  # noqa: F401

        self.assert_table_columns(
            "secret_message",
            {"id", "content", "visitor_id", "created_at", "is_read"},
        )

    def test_app_config_table_has_required_columns(self) -> None:
        from app.models.config import AppConfig  # noqa: F401

        self.assert_table_columns(
            "app_config",
            {
                "id",
                "visitor_password_enabled",
                "visitor_password_hash",
                "bloom_enabled_default",
                "particle_tier_default",
                "fallback_button_text",
                "updated_at",
            },
        )

    def test_database_seed_creates_app_config_singleton(self) -> None:
        from app.database import SessionLocal, initialize_database
        from app.models.config import AppConfig

        Base.metadata.create_all(bind=engine)
        with SessionLocal() as session:
            session.query(AppConfig).filter(AppConfig.id == 1).delete()
            session.commit()

        initialize_database()

        with SessionLocal() as session:
            config = session.get(AppConfig, 1)
            self.assertIsNotNone(config)
            assert config is not None
            self.assertTrue(config.visitor_password_enabled)
            self.assertTrue(config.bloom_enabled_default)
            self.assertEqual("medium", config.particle_tier_default)

    def test_database_seed_creates_default_blessing(self) -> None:
        from app.database import SessionLocal, initialize_database
        from app.models.blessing import BlessingText

        Base.metadata.create_all(bind=engine)
        with SessionLocal() as session:
            session.query(BlessingText).delete()
            session.commit()

        initialize_database()

        with SessionLocal() as session:
            blessing = session.query(BlessingText).order_by(BlessingText.id).first()
            self.assertIsNotNone(blessing)
            assert blessing is not None
            self.assertTrue(blessing.paragraphs)
            self.assertEqual("\n\n".join(blessing.paragraphs), blessing.content)


if __name__ == "__main__":
    unittest.main()

from pathlib import Path
import unittest


class DatabaseConfigurationTests(unittest.TestCase):
    def test_sqlite_engine_creates_database_file(self) -> None:
        from app.database import engine

        with engine.connect() as connection:
            connection.exec_driver_sql("SELECT 1")

        self.assertTrue(Path("data/app.db").is_file())

    def test_session_can_be_created_and_closed(self) -> None:
        from sqlalchemy.orm import Session

        from app.database import Base, SessionLocal, get_db

        self.assertIsNotNone(Base.metadata)

        session = SessionLocal()
        self.assertIsInstance(session, Session)
        session.close()

        dependency = get_db()
        dependency_session = next(dependency)
        self.assertIsInstance(dependency_session, Session)
        with self.assertRaises(StopIteration):
            next(dependency)


if __name__ == "__main__":
    unittest.main()

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    ADMIN_PASSWORD: str = "admin123"
    JWT_SECRET: str = "development-only-change-me-at-least-32-bytes"
    ADMIN_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./data/app.db"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]


settings = Settings()

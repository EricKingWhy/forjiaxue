from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.blessing import router as blessing_router
from app.api.config import router as config_router
from app.api.messages import router as messages_router
from app.api.music import router as music_router
from app.api.photos import router as photos_router
from app.api.stats import router as stats_router
from app.config import settings
from app.database import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield

app = FastAPI(
    title="ForJiaXue Backend",
    description="Backend API for romantic interactive webpage",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(photos_router)
app.include_router(music_router)
app.include_router(config_router)
app.include_router(blessing_router)
app.include_router(messages_router)
app.include_router(stats_router)
app.include_router(admin_router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

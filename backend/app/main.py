from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="ForJiaXue Backend",
    description="Backend API for romantic interactive webpage",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
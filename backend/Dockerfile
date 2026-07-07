# syntax=docker/dockerfile:1.7
# Python 3.11 slim backend for FastAPI (T152)
# Non-root user, persistent data/uploads dirs writable.

FROM python:3.11-slim AS base
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

# opencv-python needs libGL1 + libglib2.0-0 at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# Persistent directories (mounted as volumes in compose)
RUN mkdir -p /app/data /app/uploads/original /app/uploads/webp \
    /app/uploads/thumb /app/uploads/music /app/uploads/particle_map \
    && chown -R app:app /app

COPY --chown=app:app . .
USER app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

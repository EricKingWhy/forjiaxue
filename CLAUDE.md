# CLAUDE.md

## Project Goal

This project is a private interactive romantic webpage.

It must include:
- intro interaction
- photo particle aggregation
- 3D memory photo wall
- scroll storytelling
- music reactive visuals
- MediaPipe gesture unlock
- FastAPI admin panel
- photo upload and processing
- private access link
- basic access events

## Tech Stack

Frontend:
- Next.js
- React
- TypeScript
- React Three Fiber
- Three.js
- @react-three/drei
- GSAP
- Framer Motion
- Zustand
- Web Audio API
- MediaPipe Hand Landmarker

Backend:
- Python 3.11
- FastAPI
- SQLite
- SQLAlchemy
- Pillow
- OpenCV
- local uploads directory

## Core Rules

- Think before coding.
- Do not guess requirements. Ask or write assumptions clearly.
- Prefer small, verifiable implementation steps.
- Do not edit unrelated files.
- Do not rewrite large modules unless explicitly requested.
- Do not claim completion without verification evidence.
- After changing code, run the smallest relevant validation command.
- If a command fails, report the exact error and fix the root cause.
- Keep the visual experience smooth on mobile devices.
- Every advanced effect must have a fallback.

## Product Direction

The experience should feel restrained, elegant, and private.
Do not create a cheap template page.
Do not overload the page with too many effects.

Core emotional path:
1. Start
2. Photo emerges from particles
3. Memories appear as a 3D wall
4. Music drives subtle visual changes
5. Gesture unlock reveals the final message

## Implementation Constraints

- Do not use react-particle-image.
- Implement the main photo particle scene with React Three Fiber + Three.js Shader.
- Use Particular Drift only as a reference for image-to-particles, edge flow, GLSL, and flow-field ideas.
- Use Interactive Particles only as a reference for off-screen texture, mouse/touch disturbance, and shader interaction.
- Do not copy reference project source code directly.
- Keep backend and frontend clearly separated.

## Frontend Layering

- app: Next.js routes
- components: UI and scene components
- three: shader, geometry, particle engine, R3F utilities
- hooks: audio, gesture, story config
- stores: Zustand state
- lib: API client and shared helpers

## Backend Layering

- api: FastAPI routers
- schemas: Pydantic request and response models
- models: SQLAlchemy models
- services: image processing, story config, access, events
- core: config and shared utilities

## Required Validation

Frontend:
- npm run lint
- npm run build
- manual mobile viewport test

Backend:
- uvicorn app.main:app --reload
- curl /api/health
- manual Swagger test for upload and story APIs

Deployment:
- docker compose up --build
- open /love/{slug}
CLAUDE
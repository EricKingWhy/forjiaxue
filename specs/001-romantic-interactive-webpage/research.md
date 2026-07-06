# Research: ForJiaXue - Romantic Interactive Webpage

**Feature**: 001-romantic-interactive-webpage
**Created**: 2026-07-06

## Technology Stack Decisions

### Frontend Framework: Next.js + React + TypeScript

**Decision**: Use Next.js 14+ with App Router for frontend

**Rationale**: 
- Next.js provides SSR/SSG capabilities for better initial load performance
- App Router supports React Server Components for optimized bundle sizes
- TypeScript ensures type safety for complex 3D/particle interactions
- Built-in API routes for backend communication
- Vercel deployment optimization

**Alternatives considered**:
- Vite + React: Faster dev server but lacks SSR, deployment complexity
- Pure React SPA: No SSR benefits, SEO concerns, no built-in API routes

---

### 3D Graphics: React Three Fiber + Three.js

**Decision**: Use React Three Fiber (R3F) with custom Three.js shaders for particle system

**Rationale**:
- R3F provides declarative React integration for Three.js
- Custom GLSL shaders enable high-performance particle rendering (60k+ particles)
- @react-three/drei offers pre-built helpers (OrbitControls, Environment)
- Better React state integration than vanilla Three.js

**Alternatives considered**:
- Vanilla Three.js: More control but complex React integration
- PixiJS: Better for 2D particles, limited 3D capabilities
- Babylon.js: Excellent 3D but larger bundle, less React ecosystem support

---

### Animation Libraries: GSAP + Framer Motion

**Decision**: Use GSAP for complex timeline animations, Framer Motion for React component animations

**Rationale**:
- GSAP excels at complex timeline orchestration (particle aggregation sequence)
- Framer Motion integrates naturally with React components (page transitions)
- Both libraries optimized for 60fps performance
- GSAP ScrollTrigger for vertical scroll narrative

**Alternatives considered**:
- Anime.js: Lighter but less powerful timeline control
- Pure CSS animations: Limited control for complex sequences

---

### State Management: Zustand

**Decision**: Use Zustand for global state management

**Rationale**:
- Minimal bundle size (~1KB)
- Simple API, no boilerplate
- Supports middleware for persistence
- Perfect for audio/gesture/scroll state coordination

**Alternatives considered**:
- Redux Toolkit: More powerful but heavier, more boilerplate
- React Context: Good but performance issues with frequent updates

---

### Audio Analysis: Web Audio API

**Decision**: Use Web Audio API with AnalyserNode for real-time frequency analysis

**Rationale**:
- Native browser API, no external dependencies
- AnalyserNode provides real-time FFT frequency data
- Can drive particle effects (brightness, size, spread, star intensity)
- Low latency for music synchronization

**Implementation approach**:
- Create AudioContext on user click (autoplay policy compliance)
- AnalyserNode with FFT size 256 for high-frequency detection
- Map frequency bins to particle parameters via uniform updates

---

### Gesture Recognition: MediaPipe Hand Landmarker

**Decision**: Use MediaPipe Hand Landmarker via @mediapipe/hands or TensorFlow.js

**Rationale**:
- Real-time hand tracking with landmark detection
- Can detect two-finger heart shape gesture
- Works on mobile browsers (iPhone 16 Pro Max target)
- Provides 21 hand landmarks for precise gesture matching

**Implementation approach**:
- Load MediaPipe model via CDN or npm package
- Detect when index fingers cross and form heart shape
- Implement fallback button after 4 failed attempts

---

### Backend Framework: FastAPI + Python 3.11

**Decision**: Use FastAPI for REST API backend

**Rationale**:
- Async support for file upload handling
- Automatic OpenAPI documentation (Swagger UI)
- Pydantic validation for request/response schemas
- Excellent performance for API endpoints
- Python ecosystem for image processing (Pillow, OpenCV)

**Alternatives considered**:
- Flask: Sync-only, more manual boilerplate
- Django: Overkill for simple API + admin panel

---

### Database: SQLite + SQLAlchemy

**Decision**: Use SQLite at `backend/data/app.db` with SQLAlchemy ORM

**Rationale**:
- User requirement: SQLite at backend/data/app.db
- Simple setup, no external database service needed
- SQLAlchemy provides async support (SQLAlchemy 2.0+)
- Adequate for single-admin, low-traffic personal project

**Note**: For serverless deployment (Vercel/Cloudflare), SQLite file must persist. Consider VPS deployment or volume mount.

---

### Image Processing: Pillow + OpenCV

**Decision**: Use Pillow for EXIF removal and WebP conversion, OpenCV for particle map generation

**Rationale**:
- Pillow: Simple EXIF stripping, format conversion
- OpenCV: Efficient image analysis for particle position mapping
- Both mature, well-documented libraries

**Implementation approach**:
- On upload: Strip EXIF → Convert to WebP → Generate thumbnail → Create particle position map

---

## Performance Optimization Decisions

### Particle System Performance Tiers

**Decision**: Three-tier system with auto-detection

| Tier | Particle Count | Target Device | Trigger |
|------|---------------|---------------|---------|
| High | 60,000 | Desktop GPU | High-end devices |
| Medium | 30,000 | Mobile (default) | Touch device detection |
| Low | 12,000 | Low-performance | FPS drop detection |

**Rationale**: Balances visual quality with performance across device spectrum

---

### Bloom/Glow Effect Strategy

**Decision**: Optional effect, auto-disabled on low-performance devices

**Implementation approach**:
- Use Three.js EffectComposer with UnrealBloomPass
- Monitor FPS; if drops below 45fps consistently, disable Bloom
- Configurable toggle in admin panel

---

### Asset Optimization

**Decision**: Multi-resolution assets and lazy loading

**Implementation approach**:
- WebP compression for all photos (quality 85)
- Thumbnails for photo wall (300px height)
- Particle position maps pre-computed and cached
- Music streaming (not preload entire file)

---

## Security & Privacy Decisions

### IP Hashing

**Decision**: Store SHA-256 hash of IP addresses, never raw IP

**Rationale**: Privacy protection while maintaining visitor tracking capability

---

### Password Protection

**Decision**: Dual password system
- Visitor access: Default enabled, simple password check
- Admin panel: ADMIN_PASSWORD environment variable

**Implementation approach**:
- Visitor password stored in database (configurable)
- Admin password from environment (not in database)

---

### EXIF Removal

**Decision**: Complete EXIF stripping on all uploaded photos

**Implementation approach**:
- Pillow Image.info clearing
- Save as new WebP file (EXIF-free format)

---

## Deployment Architecture

### Target: VPS with persistent storage

**Decision**: Deploy to VPS (not Vercel/Cloudflare serverless) due to SQLite requirement

**Rationale**:
- SQLite file needs persistent filesystem
- Uploads directory needs persistence
- VPS provides full control over storage

**Recommended platforms**:
- Railway.app (persistent volumes)
- DigitalOcean Droplet
- Self-hosted VPS

---

## Key Integration Patterns

### Frontend ↔ Backend Communication

**Decision**: REST API over JSON

**Endpoints**:
- `/api/photos` - Photo CRUD
- `/api/music` - Music upload/retrieve
- `/api/config` - Blessing text, password settings
- `/api/stats` - Visitor statistics
- `/api/messages` - Secret messages
- `/api/admin/auth` - Admin authentication

---

### Particle Map Generation

**Decision**: Pre-compute particle positions from image on upload, store as JSON

**Rationale**:
- Computing 60k particle positions at runtime is expensive
- Pre-computation enables instant aggregation animation
- Stored in `uploads/particle_map/` directory

---

### Audio-Visual Synchronization

**Decision**: Uniform-based shader parameter updates driven by AnalyserNode

**Implementation approach**:
- AnalyserNode outputs frequency array (256 bins)
- Map high-frequency bins (150-256) to particle shader uniforms
- Update uniforms each frame via R3F useFrame hook
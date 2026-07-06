# Quickstart: ForJiaXue - Romantic Interactive Webpage

**Feature**: 001-romantic-interactive-webpage
**Created**: 2026-07-06

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Modern browser with WebGL, Web Audio API support
- (Optional) GPU for high particle tier performance

## Setup

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Initialize database
python -c "from app.database import init_db; init_db()"

# Set environment variables
export ADMIN_PASSWORD="your_secure_password"

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

API docs available at `http://localhost:8000/docs` (Swagger UI)

### Frontend Setup

```bash
cd frontend
npm install

# Configure API URL (in .env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Validation Scenarios

### Scenario 1: Entry Screen

**Purpose**: Validate entry animation and music trigger

**Steps**:
1. Open `http://localhost:3000/ForJiaXue`
2. Observe floating petal animation
3. (If password enabled) Enter visitor password
4. Click "开始" button
5. Verify music starts playing
6. Verify smooth transition to particle screen

**Expected outcome**: Music plays, transition completes, particle screen visible

**Time budget**: Entry → particle screen in <3 seconds

---

### Scenario 2: Photo Particle Aggregation

**Purpose**: Validate particle system and photo display

**Steps**:
1. After entry, observe particles flowing from edges
2. Wait for aggregation to complete (5-8 seconds)
3. Verify main photo appears clearly
4. Move mouse/finger over photo
5. Observe particles scatter
6. Wait 3 seconds
7. Verify particles return smoothly

**Expected outcome**: 
- Particles aggregate into recognizable photo
- Scatter effect visible on interaction
- Smooth return animation

**Performance check**: FPS stays above 55 during aggregation

---

### Scenario 3: 3D Photo Wall

**Purpose**: Validate photo wall browsing and interaction

**Steps**:
1. Click "下一步" button
2. Scroll vertically to photo wall section
3. Observe 6-12 photos in cylindrical arrangement
4. Scroll/drag to rotate wall
5. Click a photo to enlarge
6. Click again or scroll to dismiss

**Expected outcome**:
- Cylindrical arrangement visible
- Rotation works smoothly
- Enlargement and dismiss functional

---

### Scenario 4: Music-Driven Effects

**Purpose**: Validate audio-visual synchronization

**Steps**:
1. Play music with distinct high-frequency content
2. Observe particle brightness fluctuations
3. Observe particle size changes
4. Observe background star intensity changes
5. Verify effects sync with music rhythm

**Expected outcome**: Clear visual response to music frequency changes

---

### Scenario 5: Gesture Unlock

**Purpose**: Validate hand gesture recognition

**Steps**:
1. Scroll to unlock section
2. Grant camera permission
3. Form heart shape with two fingers
4. Verify unlock detection
5. (Alternative) Fail 4 times
6. Verify fallback button appears: "识别不到？点击这里继续"
7. Click fallback button

**Expected outcome**:
- Gesture recognized within 3 attempts (80% success rate)
- Fallback appears after 4 failures
- Either method unlocks finale

---

### Scenario 6: Finale Display

**Purpose**: Validate final message and animations

**Steps**:
1. After unlock, observe finale screen
2. Watch romantic animations (petals, roses)
3. Observe typewriter effect for blessing text
4. Verify multi-paragraph text displays sequentially

**Expected outcome**:
- Animations play smoothly
- Typewriter effect visible
- All paragraphs display

---

### Scenario 7: Admin Panel

**Purpose**: Validate admin functionality

**Steps**:
1. Open `http://localhost:8000/admin` (or frontend admin route)
2. Enter ADMIN_PASSWORD
3. Upload a test photo (jpg, <10MB)
4. Verify photo appears in photo list
5. Upload test music (mp3, <20MB)
6. Edit blessing text (add test paragraph)
7. View statistics dashboard
8. Send test secret message from visitor side
9. Verify message appears in admin panel

**Expected outcome**:
- All CRUD operations work
- Statistics display correctly
- Secret messages received

---

### Scenario 8: Performance Tier Detection

**Purpose**: Validate auto-tier selection

**Steps**:
1. Open on desktop browser → verify high or medium tier
2. Open on mobile browser → verify medium tier
3. Simulate low-performance (throttle CPU in dev tools)
4. Verify auto-switch to low tier
5. Verify Bloom disabled on low tier

**Expected outcome**: Tier auto-adjusts based on device performance

---

### Scenario 9: Privacy Validation

**Purpose**: Verify EXIF removal and IP hashing

**Steps**:
1. Upload photo with EXIF metadata
2. Download processed WebP from backend
3. Verify no EXIF in processed file
4. Check database for VisitEvent
5. Verify only ip_hash stored (no raw IP)

**Expected outcome**:
- EXIF completely removed
- IP addresses hashed only

---

### Scenario 10: File Validation

**Purpose**: Verify file size and format restrictions

**Steps**:
1. Upload photo >10MB → verify rejection with error message
2. Upload unsupported format (e.g., gif) → verify rejection
3. Upload music >20MB → verify rejection
4. Upload unsupported music (e.g., ogg) → verify rejection

**Expected outcome**: Clear error messages for invalid uploads

---

## End-to-End Flow

Complete experience validation:

1. Entry → 2. Password → 3. Particles → 4. Photo Wall → 5. Unlock → 6. Finale → 7. Send Message

**Expected total time**: <3 minutes

**Expected FPS**: >55 throughout (except transition moments)

---

## Deployment Checklist

Before deployment:

- [ ] Admin password set (ADMIN_PASSWORD env)
- [ ] Visitor password configured (or disabled)
- [ ] Main photo uploaded and processed
- [ ] 6-12 wall photos uploaded
- [ ] Music uploaded
- [ ] Blessing text configured
- [ ] SQLite database initialized
- [ ] Uploads directory created with subdirectories
- [ ] Environment variables set
- [ ] CORS configured for frontend domain

---

## Monitoring

Key metrics to track:

- Average FPS during particle aggregation
- Gesture recognition success rate
- Average visit duration
- Photo upload processing time
- Music playback continuity
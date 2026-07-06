# Data Model: ForJiaXue - Romantic Interactive Webpage

**Feature**: 001-romantic-interactive-webpage
**Created**: 2026-07-06

## Entities

### Photo

Represents an uploaded image for display in the experience.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | Primary Key, Auto-increment | Unique identifier |
| original_filename | VARCHAR(255) | Required | Original upload filename |
| original_path | VARCHAR(500) | Required | Path in `uploads/original/` |
| webp_path | VARCHAR(500) | Required | Path in `uploads/webp/` |
| thumbnail_path | VARCHAR(500) | Required | Path in `uploads/thumb/` |
| particle_map_path | VARCHAR(500) | Required | Path in `uploads/particle_map/` |
| display_order | INTEGER | Default: 0 | Order for photo wall display |
| is_main_photo | BOOLEAN | Default: false | True for single main particle photo |
| created_at | DATETIME | Auto-generated | Upload timestamp |
| updated_at | DATETIME | Auto-updated | Last modification |

**Relationships**: None (standalone entity)

**Validation rules**:
- File format: jpg, jpeg, png, webp
- Max size: 10MB
- EXIF must be removed on processing
- Automatically converted to WebP (quality 85)
- Thumbnail: 300px height, proportional width
- Particle map: JSON array of {x, y, color} for each particle position

---

### MusicTrack

Represents background music for the experience.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | Primary Key, Auto-increment | Unique identifier |
| original_filename | VARCHAR(255) | Required | Original upload filename |
| music_path | VARCHAR(500) | Required | Path in `uploads/music/` |
| is_active | BOOLEAN | Default: true | Only one active track at a time |
| created_at | DATETIME | Auto-generated | Upload timestamp |

**Relationships**: None (standalone entity)

**Validation rules**:
- File format: mp3, m4a, wav
- Max size: 20MB
- Only one track can be `is_active: true` at any time

---

### BlessingText

Represents the final message displayed after gesture unlock.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | Primary Key, Auto-increment | Unique identifier |
| content | TEXT | Required, supports multi-paragraph | Blessing message content |
| paragraphs | JSON | Array of strings | Paragraphs for typewriter effect |
| updated_at | DATETIME | Auto-updated | Last modification timestamp |

**Relationships**: None (standalone entity)

**Validation rules**:
- Content must be split into paragraphs for typewriter effect
- Each paragraph displayed sequentially with typewriter animation

---

### VisitEvent

Records visitor access to the experience.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | Primary Key, Auto-increment | Unique identifier |
| ip_hash | VARCHAR(64) | Required, SHA-256 | Hashed IP address (privacy) |
| device_type | VARCHAR(50) | Required | "mobile", "tablet", "desktop" |
| user_agent | VARCHAR(500) | Optional | Browser user agent string |
| entered_at | DATETIME | Required | Entry timestamp |
| exited_at | DATETIME | Optional | Exit timestamp |
| duration_seconds | INTEGER | Computed | Calculated from entered_at - exited_at |
| screens_completed | JSON | Array of strings | Screens visited: ["entry", "particles", "wall", "unlock", "finale"] |
| gesture_attempts | INTEGER | Default: 0 | Number of gesture unlock attempts |
| unlock_method | VARCHAR(20) | Optional | "gesture" or "fallback" |

**Relationships**: None (standalone entity)

**Validation rules**:
- Never store raw IP address, only SHA-256 hash
- duration_seconds computed when exited_at is set
- screens_completed tracks user journey progression

---

### SecretMessage

Represents a message sent by visitor to admin.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | Primary Key, Auto-increment | Unique identifier |
| content | TEXT | Required | Message content |
| visitor_id | VARCHAR(64) | Optional | Link to VisitEvent ip_hash |
| created_at | DATETIME | Auto-generated | Message timestamp |
| is_read | BOOLEAN | Default: false | Admin read status |

**Relationships**: 
- Optional link to VisitEvent via ip_hash (soft reference)

**Validation rules**:
- Content limited to reasonable message length (5000 chars)
- Not realtime - admin views in dashboard

---

### AppConfig

Application configuration settings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | Primary Key | Singleton (id=1) |
| visitor_password_enabled | BOOLEAN | Default: true | Enable visitor password |
| visitor_password_hash | VARCHAR(64) | Optional, SHA-256 | Hashed visitor password |
| bloom_enabled_default | BOOLEAN | Default: true | Default Bloom effect setting |
| particle_tier_default | VARCHAR(10) | Default: "medium" | "high", "medium", "low" |
| fallback_button_text | VARCHAR(100) | Default: "识别不到？点击这里继续" | Gesture fallback button text |
| updated_at | DATETIME | Auto-updated | Last modification |

**Relationships**: None (singleton entity)

**Validation rules**:
- Only one AppConfig row exists (id=1)
- Visitor password stored as hash (not plaintext)

---

## Entity Diagram

```text
Photo ─────────────────────┐
MusicTrack ────────────────│───> Frontend Experience
BlessingText ──────────────│
AppConfig ─────────────────┘

VisitEvent ────────────────> Admin Dashboard
SecretMessage ─────────────> Admin Dashboard
```

## Data Volume Assumptions

- Photos: 1 main + 6-12 wall photos = ~13 max
- MusicTrack: 1 active track
- VisitEvents: Low volume (personal use), estimate <100/month
- SecretMessages: Very low volume, estimate <10/month

## Storage Paths

```text
backend/data/app.db          # SQLite database
uploads/
├── original/                # Original uploaded photos
├── webp/                    # Processed WebP photos
├── thumb/                   # Thumbnails (300px height)
├── music/                   # Music files
├── particle_map/            # Pre-computed particle positions (JSON)
```

## Migrations

Database migrations managed by SQLAlchemy/Alembic:
1. Initial schema creation
2. Seed AppConfig singleton (id=1)
3. Create default BlessingText placeholder
# API Contracts: ForJiaXue Backend

**Feature**: 001-romantic-interactive-webpage
**Created**: 2026-07-06

## Base URL

```
/api
```

All endpoints return JSON. Authentication required for admin endpoints.

---

## Public Endpoints (Visitor Access)

### Get Active Photos

Retrieves photos for frontend display.

```
GET /photos
```

**Response**:
```json
{
  "main_photo": {
    "id": 1,
    "webp_url": "/uploads/webp/photo1.webp",
    "particle_map_url": "/uploads/particle_map/photo1.json",
    "is_main_photo": true
  },
  "wall_photos": [
    {
      "id": 2,
      "webp_url": "/uploads/webp/photo2.webp",
      "thumbnail_url": "/uploads/thumb/photo2.webp",
      "display_order": 1
    }
  ]
}
```

---

### Get Active Music

Retrieves active background music.

```
GET /music
```

**Response**:
```json
{
  "id": 1,
  "music_url": "/uploads/music/track.mp3",
  "original_filename": "love_song.mp3"
}
```

---

### Get Config

Retrieves frontend configuration.

```
GET /config
```

**Response**:
```json
{
  "visitor_password_enabled": true,
  "bloom_enabled_default": true,
  "particle_tier_default": "medium",
  "fallback_button_text": "识别不到？点击这里继续"
}
```

---

### Verify Visitor Password

Checks visitor access password.

```
POST /config/verify-password
```

**Request**:
```json
{
  "password": "string"
}
```

**Response (success)**:
```json
{
  "valid": true
}
```

**Response (failure)**:
```json
{
  "valid": false,
  "error": "密码错误"
}
```

---

### Submit Secret Message

Visitor sends message to admin.

```
POST /messages
```

**Request**:
```json
{
  "content": "string (max 5000 chars)"
}
```

**Response**:
```json
{
  "id": 1,
  "created_at": "2026-07-06T12:00:00Z"
}
```

---

### Record Visit Event

Tracks visitor session (called by frontend).

```
POST /stats/visit
```

**Request (entry)**:
```json
{
  "ip_hash": "string (SHA-256)",
  "device_type": "mobile|tablet|desktop",
  "user_agent": "string",
  "action": "enter"
}
```

**Request (exit)**:
```json
{
  "ip_hash": "string",
  "action": "exit",
  "screens_completed": ["entry", "particles", "wall", "unlock", "finale"],
  "gesture_attempts": 2,
  "unlock_method": "gesture|fallback"
}
```

**Response**:
```json
{
  "event_id": 1
}
```

---

### Get Blessing Text

Retrieves blessing content for finale.

```
GET /blessing
```

**Response**:
```json
{
  "paragraphs": [
    "第一段祝福文字...",
    "第二段祝福文字...",
    "第三段祝福文字..."
  ]
}
```

---

## Admin Endpoints (Authentication Required)

All admin endpoints require header:
```
Authorization: Bearer <admin_token>
```

Admin token obtained via `/admin/auth`.

---

### Admin Login

Authenticates admin with password.

```
POST /admin/auth
```

**Request**:
```json
{
  "password": "string (ADMIN_PASSWORD env var)"
}
```

**Response**:
```json
{
  "token": "string (JWT or session token)",
  "expires_at": "2026-07-06T13:00:00Z"
}
```

---

### Upload Photo

Uploads and processes a photo.

```
POST /admin/photos
Content-Type: multipart/form-data
```

**Request**:
- `file`: image file (jpg/jpeg/png/webp, max 10MB)
- `is_main_photo`: boolean (optional, default false)
- `display_order`: integer (optional)

**Response**:
```json
{
  "id": 1,
  "original_filename": "photo.jpg",
  "webp_url": "/uploads/webp/photo.webp",
  "thumbnail_url": "/uploads/thumb/photo.webp",
  "particle_map_url": "/uploads/particle_map/photo.json",
  "is_main_photo": false,
  "created_at": "2026-07-06T12:00:00Z"
}
```

**Processing**:
1. EXIF removal
2. WebP conversion (quality 85)
3. Thumbnail generation (300px height)
4. Particle map computation (JSON positions)

---

### Delete Photo

Removes a photo.

```
DELETE /admin/photos/{id}
```

**Response**:
```json
{
  "deleted": true
}
```

---

### Update Photo Order

Changes display order or main photo status.

```
PATCH /admin/photos/{id}
```

**Request**:
```json
{
  "display_order": 5,
  "is_main_photo": true
}
```

**Response**:
```json
{
  "id": 1,
  "display_order": 5,
  "is_main_photo": true
}
```

---

### Upload Music

Uploads and activates new music.

```
POST /admin/music
Content-Type: multipart/form-data
```

**Request**:
- `file`: audio file (mp3/m4a/wav, max 20MB)

**Response**:
```json
{
  "id": 2,
  "music_url": "/uploads/music/new_track.mp3",
  "is_active": true
}
```

---

### Update Blessing Text

Edits finale blessing content.

```
PUT /admin/blessing
```

**Request**:
```json
{
  "paragraphs": [
    "新的第一段...",
    "新的第二段...",
    "新的第三段..."
  ]
}
```

**Response**:
```json
{
  "id": 1,
  "paragraphs": ["...", "...", "..."],
  "updated_at": "2026-07-06T12:30:00Z"
}
```

---

### Update Config

Modifies app settings.

```
PUT /admin/config
```

**Request**:
```json
{
  "visitor_password_enabled": true,
  "visitor_password": "new_password",
  "bloom_enabled_default": true,
  "particle_tier_default": "medium"
}
```

**Response**:
```json
{
  "visitor_password_enabled": true,
  "bloom_enabled_default": true,
  "particle_tier_default": "medium",
  "updated_at": "2026-07-06T12:00:00Z"
}
```

---

### Get Statistics Dashboard

Retrieves visitor statistics.

```
GET /admin/stats
```

**Response**:
```json
{
  "total_visits": 50,
  "visits_this_week": 12,
  "average_duration_seconds": 180,
  "device_breakdown": {
    "mobile": 30,
    "desktop": 15,
    "tablet": 5
  },
  "unlock_method_breakdown": {
    "gesture": 35,
    "fallback": 15
  },
  "recent_visits": [
    {
      "ip_hash": "abc123...",
      "device_type": "mobile",
      "entered_at": "2026-07-06T10:00:00Z",
      "duration_seconds": 200,
      "screens_completed": ["entry", "particles", "wall", "unlock", "finale"]
    }
  ]
}
```

---

### Get Secret Messages

Retrieves visitor messages.

```
GET /admin/messages
```

**Response**:
```json
{
  "messages": [
    {
      "id": 1,
      "content": "悄悄话内容...",
      "created_at": "2026-07-06T11:00:00Z",
      "is_read": false
    }
  ],
  "unread_count": 3
}
```

---

### Mark Message Read

Marks a message as read.

```
PATCH /admin/messages/{id}
```

**Request**:
```json
{
  "is_read": true
}
```

**Response**:
```json
{
  "id": 1,
  "is_read": true
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "status": 400
}
```

**Common errors**:
- 400: Invalid request (file too large, wrong format)
- 401: Unauthorized (invalid admin token)
- 403: Forbidden (wrong password)
- 404: Not found (photo/music not found)
- 500: Server error
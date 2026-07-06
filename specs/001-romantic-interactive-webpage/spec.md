# Feature Specification: ForJiaXue - Romantic Interactive Webpage

**Feature Branch**: `001-romantic-interactive-webpage`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "这是一个送给喜欢的人的私密互动网页项目"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entry Experience (Priority: P1) 🎯 MVP

A visitor opens the private link `/ForJiaXue` and sees a beautiful entry animation with floating petals. They click to begin the romantic journey, triggering background music that plays throughout the entire experience.

**Why this priority**: This is the first impression and essential gateway to the entire experience. Without a working entry, nothing else can be experienced.

**Independent Test**: Can be fully tested by opening `/ForJiaXue`, observing the petal animation, clicking the start button, and verifying music begins playing with a smooth transition animation.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/ForJiaXue`, **When** the page loads, **Then** floating petal animation is displayed on screen
2. **Given** the entry screen is displayed, **When** the visitor clicks the start button, **Then** background music begins playing
3. **Given** music has started, **When** the transition completes, **Then** the visitor is smoothly transitioned to the photo particle screen
4. **Given** music is playing, **When** the visitor navigates through all screens, **Then** music continues playing without interruption

---

### User Story 2 - Photo Particle Aggregation (Priority: P1)

A visitor watches as thousands of light particles flow from all directions and slowly aggregate into beautiful photos. They can interact by moving their mouse to gently scatter the particles, which gracefully return to their original positions.

**Why this priority**: This is the core emotional moment of the experience - the visual "reveal" that creates surprise and wonder.

**Independent Test**: Can be tested by observing particles aggregate over 5-8 seconds into recognizable photos, moving the mouse to scatter particles, and watching them return within 3 seconds.

**Acceptance Scenarios**:

1. **Given** the visitor has entered the second screen, **When** the particle animation begins, **Then** particles flow from screen edges toward the center
2. **Given** particles are flowing, **When** 5-8 seconds pass, **Then** particles aggregate to form clear photo images
3. **Given** photos are formed, **When** the visitor moves their mouse over the image, **Then** nearby particles gently scatter within an optimal radius
4. **Given** particles have scattered, **When** 3 seconds pass without further interaction, **Then** particles smoothly return to their positions with linear animation
5. **Given** the visitor has viewed the photo aggregation, **When** they click "Next", **Then** they transition to the 3D photo wall screen

---

### User Story 3 - 3D Memory Photo Wall (Priority: P2)

A visitor browses a collection of 12 photos arranged in a cylindrical floating display. They can scroll, drag, or click to explore the memories, with ambient music-driven lighting effects enhancing the atmosphere.

**Why this priority**: This extends the emotional experience from single photo reveal to a collection of shared memories, deepening engagement.

**Independent Test**: Can be tested by scrolling through the photo wall, clicking individual photos to enlarge them, and observing music-driven lighting fluctuations.

**Acceptance Scenarios**:

1. **Given** the visitor enters the third screen, **When** the photo wall loads, **Then** 12 photos are displayed in a cylindrical arrangement floating in 3D space
2. **Given** the photo wall is displayed, **When** the visitor uses scroll wheel or drag gesture, **Then** the photo wall rotates allowing view of different photos
3. **Given** multiple photos are visible, **When** the visitor clicks a photo, **Then** that photo enlarges for detailed viewing
4. **Given** music is playing, **When** audio analysis detects high-frequency content, **Then** subtle particle/light flickering effects appear on photos
5. **Given** the enlarged photo is displayed, **When** the visitor dismisses it, **Then** they return to the cylindrical browsing view

---

### User Story 4 - Gesture Unlock and Final Revelation (Priority: P3)

A visitor attempts to unlock the final message by forming a heart shape with two fingers. After successful recognition or opting to skip, they see a beautiful finale with romantic animations and heartfelt wishes.

**Why this priority**: This creates the emotional climax and personal connection, but requires all previous screens to be working first.

**Independent Test**: Can be tested by making a heart shape gesture in front of the camera, observing unlock feedback, and viewing the final animation with祝福文字.

**Acceptance Scenarios**:

1. **Given** the visitor has reached the unlock screen, **When** the camera activates, **Then** gesture recognition prompts are displayed
2. **Given** gesture prompts are shown, **When** the visitor forms a heart shape with two fingers, **Then** the system recognizes the gesture and unlocks
3. **Given** unlock fails, **When** fewer than 4 attempts have been made, **Then** a "please try again" message is shown
4. **Given** 4 attempts have failed, **When** the visitor tries again, **Then** a skip option is offered
5. **Given** the visitor unlocks or skips, **When** the finale loads, **Then** romantic animations (petals, roses) appear with blessing text
6. **Given** the finale is displayed, **When** the visitor views the blessing, **Then** text wishes them happiness every day in an elegant, refined style

---

### User Story 5 - Admin Panel Management (Priority: P2)

An administrator logs into the private admin panel to upload photos, configure music, edit display text, and view visitor statistics including secret messages left by visitors.

**Why this priority**: Essential for content management, but can be developed alongside the frontend experience.

**Independent Test**: Can be tested by logging into admin panel, uploading a photo, viewing statistics dashboard, and receiving a secret message from a test visitor.

**Acceptance Scenarios**:

1. **Given** an administrator accesses the admin panel, **When** they authenticate, **Then** they see the management dashboard
2. **Given** the dashboard is open, **When** the admin uploads a photo, **Then** the photo is processed (EXIF removed, compressed to WebP, thumbnail generated)
3. **Given** photos are uploaded, **When** the admin deletes a photo, **Then** it is removed from the display rotation
4. **Given** the admin opens settings, **When** they upload new music, **Then** the background music is updated for visitors
5. **Given** the admin opens settings, **When** they edit blessing text, **Then** the finale message is updated
6. **Given** visitors have accessed the page, **When** the admin views statistics, **Then** access times, device types, and duration are displayed in a visual dashboard
7. **Given** a visitor sent a secret message, **When** the admin opens the message panel, **Then** the message content and timestamp are visible

---

### Edge Cases

- What happens when a visitor's browser blocks camera access for gesture recognition? → Skip option is immediately offered with an explanation
- What happens when the visitor navigates away and returns mid-experience? → Music restarts from beginning, experience resets to entry screen
- What happens when a photo fails to load? → Graceful fallback: particle aggregation shows placeholder or skips to next photo
- What happens when audio context fails to initialize? → Visual experience continues without music, visitor can click to retry audio
- What happens when gesture detection is slow on older devices? → Progress indicator shown, skip option available after 10 seconds of no recognition

## Requirements *(mandatory)*

### Functional Requirements

**Entry Screen**:
- **FR-001**: System MUST display floating petal animation before user interaction begins
- **FR-002**: System MUST provide a clear start button/clickable area to begin the experience
- **FR-003**: System MUST play background music when user clicks to start
- **FR-004**: System MUST smoothly transition to photo particle screen after music starts
- **FR-005**: System MUST maintain continuous music playback across all screens

**Photo Particle Screen**:
- **FR-006**: System MUST generate 50,000+ particles for photo aggregation
- **FR-007**: System MUST animate particles flowing from screen edges toward center over 5-8 seconds
- **FR-008**: System MUST aggregate particles into recognizable photo images
- **FR-009**: System MUST support multiple photos as aggregation targets (configurable via admin)
- **FR-010**: System MUST scatter nearby particles when mouse moves over the image
- **FR-011**: System MUST return scattered particles to original positions after 3 seconds using smooth linear animation
- **FR-012**: System MUST provide a "Next" button to proceed to photo wall

**3D Photo Wall Screen**:
- **FR-013**: System MUST display uploaded photos in a cylindrical floating arrangement in 3D space
- **FR-014**: System MUST support scroll wheel and drag gestures for rotating/browsing the wall
- **FR-015**: System MUST allow clicking individual photos to enlarge them
- **FR-016**: System MUST dismiss enlarged photos when visitor interacts again
- **FR-017**: System MUST apply music-driven lighting effects (high-frequency-triggered subtle flickering)

**Gesture Unlock Screen**:
- **FR-018**: System MUST activate device camera for gesture recognition
- **FR-019**: System MUST recognize two-finger heart shape gesture using hand tracking
- **FR-020**: System MUST count gesture attempts and show "try again" feedback for first 4 failures
- **FR-021**: System MUST offer skip unlock option after 4 failed attempts
- **FR-022**: System MUST display finale screen upon successful unlock or skip
- **FR-023**: System MUST show romantic animations (floating petals, roses) in finale
- **FR-024**: System MUST display blessing text wishing happiness with elegant styling

**Admin Panel**:
- **FR-025**: System MUST provide private admin panel access with authentication
- **FR-026**: System MUST allow photo upload with automatic processing (EXIF removal, WebP compression, thumbnail generation)
- **FR-027**: System MUST allow photo deletion from display rotation
- **FR-028**: System MUST allow music file upload and replacement
- **FR-029**: System MUST allow blessing text editing
- **FR-030**: System MUST track visitor access events (timestamp, device type, duration)
- **FR-031**: System MUST display statistics in a visual dashboard
- **FR-032**: System MUST allow visitors to send secret messages to admin
- **FR-033**: System MUST display received secret messages in admin panel

**Private Access**:
- **FR-034**: System MUST serve the experience at fixed path `/ForJiaXue`
- **FR-035**: System MUST allow multiple visitors to access the same link without restriction
- **FR-036**: System MUST maintain link validity permanently (no expiration)

### Key Entities

- **Photo**: Represents an image uploaded by admin, includes original file, processed WebP version, thumbnail, display order, upload timestamp
- **MusicTrack**: Background music file uploaded by admin, includes file data, upload timestamp
- **BlessingText**: Final message content editable by admin, includes text content, last modified timestamp
- **VisitEvent**: Access record, includes visitor identifier, timestamp, device type, screen progression, duration
- **SecretMessage**: Visitor message, includes content, timestamp, visitor identifier
- **AdminSession**: Authentication state for admin panel access

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitor can complete the full experience (entry → particles → photo wall → unlock → finale) in under 3 minutes
- **SC-002**: Photo particle aggregation completes within 5-8 seconds on target device (iPhone 16 Pro Max)
- **SC-003**: Particle scattering and return animation appears smooth at 60fps
- **SC-004**: 3D photo wall supports browsing 12 photos without visible lag
- **SC-005**: Music plays continuously without interruption across all screen transitions
- **SC-006**: Gesture unlock succeeds within 3 attempts on 80% of tests on iPhone 16 Pro Max
- **SC-007**: Admin can upload a photo and see it appear in the experience within 30 seconds
- **SC-008**: Admin can view visitor statistics including device types, durations, and secret messages
- **SC-009**: All animations and transitions feel elegant and romantic, not flashy or cheap (qualitative user satisfaction)
- **SC-010**: Experience loads and runs smoothly on target device without crashes

## Assumptions

- Target device is iPhone 16 Pro Max running iOS Safari - no mobile optimization required for other devices
- Visitor will use a modern browser with WebGL, Web Audio API, and camera access support
- Admin will access panel from a desktop browser
- Music file is provided by user in MP3 or WebM audio format
- Photos are provided by user in common image formats (JPEG, PNG, WebP)
- Single admin user manages the content (no multi-admin requirement)
- Deployment target is Vercel or Cloudflare Pages with serverless backend
- No password protection for visitor link - the `/ForJiaXue` path is the privacy mechanism
- Admin panel has simple password protection (no complex authentication system needed)
- Visitor messages are stored but not realtime - admin checks them periodically

## Phased Delivery

### Phase 1: Core Experience (MVP)
- Entry screen with petal animation
- Music playback trigger
- Photo particle aggregation (single photo first)
- Basic backend: photo upload, music upload, `/ForJiaXue` access

### Phase 2: Photo Collection
- Multi-photo support for particle aggregation
- 3D cylindrical photo wall
- Photo enlargement interaction
- Backend: multi-photo management

### Phase 3: Audio-Visual Enhancement
- Music-driven lighting effects on photo wall
- High-frequency audio analysis integration
- Effect parameter tuning for elegant appearance

### Phase 4: Gesture and Finale
- MediaPipe hand gesture recognition
- Heart shape detection
- Attempt counting and skip option
- Finale animations (petals, roses)
- Blessing text display
- Backend: text editing

### Phase 5: Admin and Analytics
- Complete admin panel UI
- Visitor statistics dashboard
- Secret message feature
- Photo processing pipeline (EXIF, WebP, thumbnails)
# Entry Particle Carousel and Gated Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a three-particle timed entry carousel and enforce button/gesture-only transitions across the three application screens.

**Architecture:** A pure flow module owns carousel timing and legal screen transitions. React renders one active business screen at a time; EntryScreen keeps at most the active and incoming iframe during a dark crossfade. This replaces scroll positioning with explicit state transitions.

**Tech Stack:** Next.js 16, React 19, TypeScript, native CSS/Tailwind, Node test runner.

---

### Task 1: Pure carousel and screen flow

**Files:**
- Create: `frontend/src/lib/experience-flow.ts`
- Create: `frontend/src/lib/experience-flow.test.mjs`

- [ ] **Step 1: Write failing tests**

Test `nextParticle()` cycles `0→1→2→0`, `particleDuration()` returns `5000/6000/8000`, and `nextExperienceScreen()` only allows `entry→christmas-tree→notes`.

- [ ] **Step 2: Verify RED**

Run `node --no-warnings --experimental-strip-types --test src/lib/experience-flow.test.mjs` from `frontend`; expect module-not-found.

- [ ] **Step 3: Implement minimal pure functions**

Export `PARTICLE_SOURCES`, `PARTICLE_DURATIONS`, `nextParticle`, `particleDuration`, `ExperienceScreen`, and `nextExperienceScreen` with deterministic values from the approved design.

- [ ] **Step 4: Verify GREEN**

Run the same Node test; expect all assertions to pass.

### Task 2: Install the third particle source

**Files:**
- Create: `frontend/public/particle-effect-3.html`
- Verify: `frontend/public/particle-effect-1.html`
- Verify: `frontend/public/particle-effect-2.html`

- [ ] **Step 1: Copy only the supplied third HTML**

Copy `C:\Users\王浩宇\Desktop\新建文件夹\particle-default-effect (2).html` to `frontend/public/particle-effect-3.html`. Do not copy unrelated desktop files.

- [ ] **Step 2: Verify source identity and static paths**

Compare SHA-256 hashes and confirm all three public files exist. No source particle code is rewritten.

### Task 3: Timed particle carousel

**Files:**
- Modify: `frontend/src/components/entry/EntryScreen.tsx`

- [ ] **Step 1: Implement timer from the tested pure schedule**

Track active and incoming particle indices. Schedule the next change using the active particle's `5000/6000/8000` duration and clean both duration and transition timers on unmount.

- [ ] **Step 2: Implement resource-conscious crossfade**

Render the active iframe and, only during the 450 ms transition, the incoming iframe. Add a dark overlay between layers so unloaded frames cannot create a white flash. After the transition, unload the previous iframe.

- [ ] **Step 3: Preserve entry control and accessibility**

Keep “进入” above all particle layers, provide distinct iframe titles, and make the fade instant under `prefers-reduced-motion` while preserving timing.

### Task 4: Explicit gated three-screen state machine

**Files:**
- Modify: `frontend/src/app/ForJiaXue/page.tsx`
- Modify: `frontend/src/hooks/useScroll.ts` only if no longer referenced elsewhere

- [ ] **Step 1: Replace stacked scroll sections**

Store `ExperienceScreen` in page state and conditionally render exactly one of EntryScreen, ChristmasTreeScreen, or NotesScreen.

- [ ] **Step 2: Connect legal transitions**

Entry `onStart` advances only to `christmas-tree`; ChristmasTree `onUnlock` advances only to `notes`. Guard duplicate callbacks during the 300 ms dark transition.

- [ ] **Step 3: Remove scroll escape paths**

Use a fixed-height, overflow-hidden page shell. Because later screens are not in the DOM, wheel, touch, PageDown, space, and arrow keys cannot bypass gates.

### Task 5: Verification and delivery

**Files:**
- Update: `docs/superpowers/plans/2026-07-07-entry-particle-carousel-and-gated-flow.md`

- [ ] **Step 1: Run focused and full checks**

Run the new Node test, all existing `*.test.mjs` tests, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

- [ ] **Step 2: Browser behavior check**

Verify the first/second/third particle changes occur after 5/6/8 seconds; scrolling and keyboard cannot reveal later screens; click enters the tree; gesture fallback enters notes; transitions have no white flash.

- [ ] **Step 3: Git safety and commit**

Review `git status` before staging, exclude references, dependencies, build output, uploads, database, media outside the three approved HTML assets, and user-owned unrelated changes. Commit and push only after checks pass.

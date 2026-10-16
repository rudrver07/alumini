# ILLUMINATE — Cinematic Scroll Animation Developer Guide

## 1. Overview & Architecture

The ILLUMINATE homepage features an interactive, canvas-based, scroll-controlled sequential animation. The system translates the user's scroll gestures into precise video frame progression using **GSAP ScrollTrigger**, an HTML5 Canvas rendering pipeline, and dynamic HTML storytelling overlays.

### Architectural Diagram
```text
User Window Scroll
       │
       ▼
GSAP ScrollTrigger (pin: true, end: "+=700%", scrub: 2.0)
       │
       ▼
ScrollController.ts (calculates normalized progress: 0.0 -> 1.0)
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
Frame Index Calculation           SceneTimeline.ts
index = floor(p * (total - 1))   Calculates scene opacity & transforms
       │                                 │
       ▼                                 ▼
FrameLoader.ts (Priority Cache)   CinematicText.tsx & FinalCTA.tsx
(Prioritizes frames in direction) (HTML Text Overlays at checkpoints)
       │
       ▼
FrameCanvas.tsx (HTML5 Canvas)
(requestAnimationFrame, HiDPI scaling, fit="cover")
```

---

## 2. Directory & Component Structure

```text
src/
  components/
    scroll-animation/
      ScrollExperience.tsx   # Parent coordinator & entry point
      FrameCanvas.tsx        # HTML5 Canvas with HiDPI, fit modes, & RAF
      FrameLoader.ts         # Directional priority preloader & cache
      ScrollController.ts    # GSAP ScrollTrigger lifecycle & mapping
      CinematicText.tsx      # HTML overlays for Scenes 1 to 5
      SceneTimeline.ts       # Checkpoint transition math
      FinalCTA.tsx           # Scene 6 with Learn More & Register Now
      LoadingScreen.tsx      # Minimalist branded buffer screen
      StaticFallback.tsx     # Reduced-motion and fallback hero

  config/
    animation.config.ts      # Checkpoints, colors, pin durations, & limits

  hooks/
    useFrameSequence.ts      # Custom hook managing frame lifecycle
    useScrollProgress.ts     # Custom hook synchronizing scroll progress

  types/
    animation.ts             # TypeScript interfaces

public/
  animation/
    frames/                  # Sequential frames (001 to 300)
    manifest.json            # Frame catalog & metadata

scripts/
  generate-frame-manifest.mjs # Automated manifest generator
```

---

## 3. How the Frame Sequence is Loaded

1. **Manifest Loading**:
   On mount, `FrameLoader.ts` requests `/animation/manifest.json`. The manifest defines the total frame count, resolution (`1280x720`), aspect ratio (`1.777`), and frame file paths.
2. **Immediate First Paint (0 Blank Screen)**:
   Frame `0` (`ezgif-frame-001.jpg`) is loaded immediately and decoded via `Image.onload`. The canvas renders Frame 0 before any scrolling occurs.
3. **Directional Priority Preloading**:
   When the user scrolls down (`direction = 1`), `FrameLoader.prioritizeSurroundingFrames(currentIndex, direction, 25)` loads the next 25 frames ahead. When reversing (`direction = -1`), it loads preceding frames.
4. **Background Concurrent Queue**:
   A non-blocking worker preloads remaining frames in chunks of 6 (`maxConcurrentLoads = 6`).
5. **Memory Management**:
   The canvas caches decoded `HTMLImageElement` instances. On mobile browsers, distant frames are gracefully bypassed if memory pressure occurs, falling back to the closest loaded frame.

---

## 4. How Scroll Progress Maps to Frames

The ScrollTrigger pins the container across `end: "+=700%"` (7x viewport height) with `scrub: 2.0` damping.

The exact mathematical frame mapping is:
```typescript
const frameIndex = Math.min(
  frameCount - 1,
  Math.floor(scrollProgress * (frameCount - 1))
);
```

- At **0%** scroll: displays frame index `0` (Frame 1).
- At **25%** scroll: displays frame index `74` (~25% of sequence).
- At **50%** scroll: displays frame index `149` (Middle frame).
- At **75%** scroll: displays frame index `224` (~75% of sequence).
- At **100%** scroll: displays frame index `299` (Final frame).

When scrolling past 100%, the pinned section naturally unpins and releases the viewport so the user can seamlessly explore the rest of the page.

---

## 5. How to Change Storytelling Text & Checkpoints

All scene definitions and scroll percentages are centralized in `src/config/animation.config.ts`. You do not need to modify component code to alter copy or timing.

```typescript
// src/config/animation.config.ts
export const CINEMATIC_SCENES: AnimationScene[] = [
  {
    id: 'scene-1',
    startProgress: 0.0,
    endProgress: 0.20,
    headline: 'EVERY GREAT IDEA BEGINS WITH A SPARK.',
    subtext: 'An entrepreneurial mindset turns observation into innovation.',
  },
  {
    id: 'scene-2',
    startProgress: 0.20,
    endProgress: 0.40,
    headline: 'IDEAS CREATE POSSIBILITIES.',
    subtext: 'POSSIBILITIES CREATE CHANGE.',
  },
  {
    id: 'scene-3',
    startProgress: 0.40,
    endProgress: 0.60,
    headline: 'THE FUTURE BELONGS TO THOSE WHO BUILD IT.',
    accent: 'Architects of Innovation',
  },
  {
    id: 'scene-4',
    startProgress: 0.60,
    endProgress: 0.80,
    headline: 'LEARN. INNOVATE. BUILD.',
    subtext: 'EXPERIENCE ENTREPRENEURSHIP LIKE NEVER BEFORE.',
  },
  {
    id: 'scene-5',
    startProgress: 0.80,
    endProgress: 0.95,
    headline: 'illuminate.',
    subtext: 'Empowering the Next Generation of Changemakers',
    supportingLabel: 'An Entrepreneurship Workshop Initiative by E-Cell, IIT Bombay',
    isIdentityReveal: true,
  },
  {
    id: 'scene-6',
    startProgress: 0.95,
    endProgress: 1.0,
    headline: 'YOUR ENTREPRENEURIAL JOURNEY STARTS HERE.',
    isFinalCTA: true,
  },
];
```

---

## 6. How to Replace or Update Animation Frames

1. Place your new sequential images in:
   ```text
   public/animation/frames/
   ```
   Supported formats: `.webp`, `.png`, `.jpg`, `.jpeg`, `.avif`.
2. Ensure filenames sort naturally (e.g., `frame_0001.webp` to `frame_0300.webp` or `ezgif-frame-001.jpg`).
3. Run the automated manifest generator:
   ```bash
   npm run generate:manifest
   ```
4. The script inspects the resolution, aspect ratio, frame count, and writes `public/animation/manifest.json`.

---

## 7. Modifying Pin Duration and Scrub Speed

In `src/config/animation.config.ts`:
```typescript
export const SCROLL_CONFIG: ScrollTriggerConfig = {
  start: 'top top',
  end: '+=700%', // Increase (e.g. '+=900%') for longer scroll, decrease (e.g. '+=500%') for faster scroll
  scrub: 2.0,   // Scrub damping in seconds. Lower values (e.g. 0.6) make it snappier.
  pin: true,
  anticipatePin: 1,
};
```

---

## 8. Mobile Responsiveness & Reduced Motion

- **Viewport Adaptation**: The canvas dynamically computes `fit="cover"` (or `"contain"`) with `ctx.drawImage` centered scaling, ensuring no distortion on phones or tablets.
- **Pixel Ratio Cap**: Canvas internal dimensions are capped at `2x` devicePixelRatio (`Math.min(window.devicePixelRatio || 1, 2)`) to prevent GPU crashes on high-density displays (e.g., iPhone Retina displays).
- **Reduced Motion Support**:
  If the operating system has `prefers-reduced-motion: reduce` active:
  - Scroll pinning and canvas frame scrub are automatically disabled.
  - The component renders `StaticFallback.tsx` with the illuminated brand identity, the final message, and the interactive **LEARN MORE** and **REGISTER NOW** buttons.
- **Button Touch Targets**: All action buttons in `FinalCTA.tsx` have minimum 48px touch targets for mobile accessibility.

---

## 9. Troubleshooting & Common Issues

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **Black canvas on mount** | Manifest missing or 0 frames | Run `npm run generate:manifest` and verify `public/animation/manifest.json` exists. |
| **Jerky scrolling on mobile** | High device pixel ratio | Ensure `CANVAS_CONFIG.maxDpr` is set to `2`. |
| **Text overlapping** | Checkpoint collision | Ensure scenes in `CINEMATIC_SCENES` have contiguous, non-overlapping `startProgress` and `endProgress`. |
| **Buttons not clicking** | Pointer events blocked | Ensure text overlay containers have `pointer-events-none` and buttons have `pointer-events-auto`. |

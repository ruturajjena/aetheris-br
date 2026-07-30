# AETHERIS Residences

A scroll-driven experience for a luxury skyscraper gated community. The reader
builds the tower by scrolling, then walks down through it.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Stack

React 18 · TypeScript · Vite · Tailwind v4 (CSS-first tokens) · GSAP +
ScrollTrigger · Lenis · SplitType · Lucide.

## The one thing that makes this work

Scroll-scrubbed video is normally janky because seeking H.264 means decoding
back to the previous keyframe. The source clips are re-encoded **all-keyframe**
(`-g 1 -sc_threshold 0 -bf 0`, `+faststart`) into `public/media`, so every seek
is a single-frame decode.

On top of that, `src/lib/useVideoScrubber.ts`:

- writes only a number on scroll, and moves the playhead on one rAF loop that
  eases toward it, so seek cost is decoupled from input rate;
- never issues a seek while one is in flight, and skips writes under half a
  frame — both are pure wasted decodes;
- calls `load()` once, because a clip that is never played is otherwise never
  fetched.

To re-encode after replacing a source, the recipe is in the git history of this
file's sibling script, or inline:

```bash
ffmpeg -i in.mp4 -an -c:v libx264 -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 \
  -crf 25 -preset slow -movflags +faststart out.mp4
```

## Scroll architecture

Lenis and ScrollTrigger share a single `gsap.ticker` loop — two independent rAF
loops is the classic source of scroll jitter.

Pinning uses CSS `position: sticky` everywhere except the horizontal Community
rail, which needs ScrollTrigger's `pin` for its dynamic end distance.

| Section    | Behaviour                                                        |
| ---------- | ---------------------------------------------------------------- |
| Hero       | 250vh sticky. Scroll drives the tower's construction; a level/percent HUD counts with it. Text leaves in sequence, camera pushes in, section dissolves to paper. |
| Interiors  | Sticky walkthrough left, narrative right, plates floating at their own parallax rates. |
| Amenities  | 420vh sticky. The clip's four quarters *are* pool → gym → games → kids, so card N is locked to quarter N, with a travelling light over the live quarter. |
| Community  | Pinned horizontal rail. A media panel holds its place while the cards stream past, scrubbing the estate flyover; its caption rewrites itself letter by letter to name whichever place is on screen. |
| Stats      | Count-up on enter.                                               |
| Gallery    | Clip-path mask reveals, per-plate parallax, hover zoom.          |
| Plans      | Blueprint sheet; strokes draw on, pointer-tracked light, room hotspots. |
| Location   | Minimal map, roads drawing on, POI list cross-highlights the pins. |

## Notes

- `prefers-reduced-motion` is honoured throughout: everything renders, nothing
  moves.
- The custom cursor is opt-in per element via `data-cursor` / `data-cursor-text`,
  and only on fine pointers.
- Type splitting waits on `document.fonts.ready` and re-splits on width change —
  lines measured against a fallback font break in the wrong places.

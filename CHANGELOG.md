# Changelog

All notable changes to `@arraypress/effect-canvas-astro` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — Unreleased

### Added

- Two gradient effects: **`mesh-gradient`** and **`grain-gradient`**.
  - `mesh-gradient` — four colour spots on distinct trajectories, domain-warped
    by fbm noise and pulled through a slow vortex, blended by inverse-distance
    weight (so there are no visible spot edges, unlike `mesh`'s discrete
    metaballs) and finished with fine grain. The modern gradient-mesh hero wash.
  - `grain-gradient` — noise-chewed colour bands under a heavy grain overlay.
    The grainy-gradient poster look; reads as texture rather than motion, so run
    it at a low `speed` (0.2–0.4).
  Both composite over the page (alpha tracks brightness) rather than replacing
  it, so they're safe behind text — including as a full-page surface.
- A **fourth colour** in the uniform contract (`u_c4`), defaulting to the accent
  hue-rotated −32° and lifted 20% so the gradient shaders get a fourth stop that
  reads as a distinct colour rather than a shade of `u_c3`. `colors` now accepts
  up to four entries.
- **`static`** (+ **`frame`**) — render one frame and never start the rAF loop.
  For effects used as wallpaper: a page surface, a decorative panel, anything
  behind body copy. Nobody perceives a background drifting at `speed: 0.5`, and
  the loop is far from free — measured on a full-viewport canvas under software
  GL, the animated path cost **~78ms of main-thread time per 3s idle and dropped
  the page from 120fps to 33fps**; static costs one draw at mount and nothing
  after. It matters most for a `position: fixed` full-page canvas, where the
  built-in offscreen pause **cannot** help: the canvas is always in the viewport,
  so the IntersectionObserver never fires and it renders forever, on every page.

### Changed

- `resolveColors` returns four colours instead of three. Purely additive — the
  seven original shaders never reference `u_c4`, so their output is unchanged.

### Fixed

- **Effects no longer turn to mud on a light background.** The second derived
  colour is documented as "accent shifted toward the page background" but was
  computed as `accent * 0.45` — a shift toward BLACK. Those are the same
  operation only while the background *is* black, which was true of every theme
  this had shipped in, so the bug stayed hidden. On a light page it produced a
  dark stop that composited over white as grey-green mud. It now mixes 55%
  toward the live `--color-bg`, giving a pale tint on light pages and a deep
  shade on dark ones. **Dark themes are unaffected** — for a black background
  the two formulas are numerically identical.

## [1.0.0] — Unreleased

### Added

- `<EffectCanvas />` — a full-bleed, absolutely-positioned `<canvas>` that
  renders one of seven animated WebGL effects (`aurora`, `mesh`, `waves`,
  `grid`, `particles`, `grain`, `liquid`). Colours derive from the live
  `--color-accent` CSS variable at mount (override with `colors`), so swapping
  brand colours / style presets re-tints every effect automatically.
  Reduced-motion → a single static frame; pauses when offscreen or the tab is
  hidden; DPR capped at 1.75; CSS-gradient fallback when WebGL is unavailable;
  `aria-hidden` + `pointer-events: none`. Extracted from the EffectCanvas shared
  across the ArrayPress Astro theme family.
- `EffectConfig` / `EffectName` types exported from
  `@arraypress/effect-canvas-astro/types`.

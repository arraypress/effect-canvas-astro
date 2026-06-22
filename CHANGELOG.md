# Changelog

All notable changes to `@arraypress/effect-canvas-astro` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

# @arraypress/effect-canvas-astro

GPU shader background canvas for Astro. Mount `<EffectCanvas />` behind a hero
or any section and it renders one of seven animated WebGL effects, tinted from
your theme's `--color-accent` token — so switching brand colours re-tints every
effect automatically, with no per-effect config.

- **Seven effects** — `aurora`, `mesh`, `waves`, `grid`, `particles`, `grain`, `liquid`
- **Token-driven colour** — derives its palette from the live `--color-accent`
  CSS variable at mount; pass explicit `colors` to override
- **Reduced-motion safe** — renders a single static frame under
  `prefers-reduced-motion: reduce`
- **Cheap** — pauses when offscreen or the tab is hidden; caps DPR at 1.75
- **Graceful fallback** — a CSS gradient when WebGL is unavailable
- **Accessible** — `aria-hidden`, `pointer-events: none`, never in the tab order
- No dependencies; no headless browser; ships as a single `.astro` component

## Install

```sh
npm i @arraypress/effect-canvas-astro
```

## Usage

The canvas is full-bleed and absolutely positioned — put it inside a
`position: relative` wrapper and layer your content above it:

```astro
---
import { EffectCanvas } from '@arraypress/effect-canvas-astro';
---
<div class="relative overflow-hidden">
  <EffectCanvas name="aurora" speed={0.6} intensity={0.7} />
  <div class="relative z-10">
    <h1>Your hero content</h1>
  </div>
</div>
```

## Props (`EffectConfig`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `'aurora' \| 'mesh' \| 'waves' \| 'grid' \| 'particles' \| 'grain' \| 'liquid'` | — | Which shader to render (required) |
| `colors` | `string[]` | from tokens | Up to three hex colours blended by the shader. Omit to derive from `--color-accent` |
| `speed` | `number` | `1` | Animation speed multiplier (clamped 0–4) |
| `intensity` | `number` | `1` | Visual strength (brightness/contrast), not opacity |
| `opacity` | `number` | `1` | Uniform canvas opacity |
| `interactive` | `boolean` | `false` | Cursor ripples (the `liquid` effect) |

See [`./types`](./src/types.ts) for the full, documented `EffectConfig`.

## How colour works

When `colors` is omitted, the shader derives its palette from the live theme
tokens at mount: `c1 = --color-accent`, `c2 = accent shifted toward the page
background`, `c3 = accent hue-rotated for depth`. That's why changing your
accent (or swapping a style preset) re-tints every effect with no extra wiring.

## License

MIT © ArrayPress

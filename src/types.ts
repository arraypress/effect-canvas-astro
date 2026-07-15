/**
 * Shader-effect type contracts. The renderer lives at
 * `src/components/effects/EffectCanvas.astro`; only the shapes live
 * here so config files (site.ts, presets.ts) and section components
 * can reference them without importing the component.
 *
 * An "effect" is a GPU-rendered animated background — a full-bleed
 * fragment shader drawn on a <canvas> behind a section's content.
 * Effects are decorative only: they sit behind real content with
 * `aria-hidden`, never receive pointer events (unless `interactive`
 * mouse-tracking is on, which still only *reads* the cursor), and
 * degrade to a static CSS gradient when WebGL is unavailable.
 *
 * Accessibility / performance guarantees (implemented by EffectCanvas):
 *   - `prefers-reduced-motion: reduce` → a single static frame is
 *     rendered; the animation loop never starts.
 *   - Offscreen (IntersectionObserver) or hidden tab → loop pauses.
 *   - Device-pixel-ratio is capped so 4K/retina screens don't pay a
 *     4× fragment cost for a decorative layer.
 */

/**
 * The built-in shader registry. Each name maps to a fragment shader
 * compiled by EffectCanvas at mount:
 *
 *   - `'aurora'`    — slow-drifting curtains of accent-tinted light.
 *                     The "premium SaaS hero" look. Calm, organic.
 *   - `'mesh'`      — animated mesh-gradient: four soft radial blobs
 *                     orbiting and blending. The Stripe/Linear look.
 *   - `'waves'`     — glowing horizontal waveform lines. On-brand for
 *                     audio storefronts; reads as "signal" elsewhere.
 *   - `'grid'`      — perspective floor-grid scrolling toward the
 *                     horizon. Retro / synthwave. Pairs with sharp
 *                     radius presets.
 *   - `'particles'` — drifting, twinkling specks with parallax
 *                     layers. Subtle; works behind dense hero copy.
 *   - `'grain'`     — animated film grain with a faint accent
 *                     vignette. The quietest option — adds texture
 *                     rather than motion.
 *   - `'liquid'`    — flowing accent water surface; pointer movement
 *                     spawns damped ripple rings. Renders OPAQUE (a
 *                     surface fill, not a glow), so it's built for
 *                     CTAs/buttons via the `.cta--fx` hook — see
 *                     `productsConfig.ctaEffect` — but works as a
 *                     full section backdrop too.
 *   - `'mesh-gradient'`
 *                   — four colour spots on distinct trajectories,
 *                     domain-warped by fbm noise and pulled through a
 *                     slow vortex, blended by inverse-distance weight
 *                     and finished with a fine grain. The modern
 *                     "gradient mesh" hero wash. Softer and far more
 *                     colourful than `mesh` (which is four discrete
 *                     metaballs); this one has no visible spot edges.
 *   - `'grain-gradient'`
 *                   — noise-distorted colour BANDS under a heavy grain
 *                     overlay. The popular grainy-gradient poster look.
 *                     Reads as texture + colour rather than motion; run
 *                     it at low `speed` for a near-static backdrop.
 *
 * `mesh-gradient` and `grain-gradient` use all FOUR colours (see
 * `colors`); every other effect uses the first three.
 */
export type EffectName =
	| 'aurora'
	| 'mesh'
	| 'waves'
	| 'grid'
	| 'particles'
	| 'grain'
	| 'liquid'
	| 'mesh-gradient'
	| 'grain-gradient';

/**
 * One effect configuration. Used three ways:
 *
 *   1. `siteConfig.hero.effect` — site-wide hero background.
 *   2. `<HomeHero effect={{ … }}>` — per-page hero override.
 *   3. `<EffectCanvas {...cfg}>` — standalone, behind any section.
 *
 * Every field except `name` is optional — the defaults are tuned to
 * look right with the active style preset out of the box, because
 * `colors` falls back to the live `--color-accent` token at runtime
 * (so switching presets re-tints every effect automatically).
 */
export interface EffectConfig {
	/** Which built-in shader to render. */
	name: EffectName;

	/**
	 * Up to FOUR CSS hex colours (e.g. `['#00e472', '#0d7377']`)
	 * blended by the shader. Omit to derive them all from the live
	 * theme tokens: c1 = `--color-accent`, c2 = accent dimmed toward
	 * the page background, c3 = accent hue-rotated +36° for depth,
	 * c4 = accent hue-rotated −32° and lifted. Non-hex values are
	 * ignored (tokens win) — shaders need raw RGB.
	 *
	 * Only `mesh-gradient` and `grain-gradient` read the fourth; the
	 * rest use the first three, so passing a 4th to them is harmless
	 * and ignored.
	 */
	colors?: string[];

	/**
	 * Animation speed multiplier. `1` = the shader's hand-tuned
	 * default; `0.5` = half speed; `2` = double. Clamped to 0–4.
	 * Default: 1.
	 */
	speed?: number;

	/**
	 * Visual strength multiplier — brightness/contrast of the effect,
	 * NOT canvas opacity (use `opacity` for uniform fading). `1` = the
	 * shader's default; lower is subtler. Clamped to 0–2. Default: 1.
	 */
	intensity?: number;

	/**
	 * Uniform canvas opacity, 0–1. Applied as a CSS `opacity` so the
	 * effect can be faded against the section background without
	 * touching shader math. Default: 1.
	 */
	opacity?: number;

	/**
	 * Render ONE frame and stop — no animation loop at all.
	 *
	 * Reach for this whenever the effect is wallpaper rather than a
	 * feature: a full-page surface, a decorative panel, anything behind
	 * body copy. Nobody perceives a background drifting at `speed: 0.5`,
	 * and the loop is not free — a full-viewport shader can cost most of
	 * a frame budget on an integrated GPU, permanently, on every page.
	 *
	 * It matters most for a `position: fixed` full-page canvas, where the
	 * built-in offscreen pause CANNOT help: the canvas is always in the
	 * viewport, so the IntersectionObserver never pauses it and it
	 * renders forever.
	 *
	 * Freeze point is `frame`. Default: false.
	 */
	static?: boolean;

	/**
	 * Which moment to freeze at when `static` is true, in shader seconds.
	 * The shaders are all time-varying, so this picks the composition —
	 * `0` is usually the blandest (every trajectory starts at its origin).
	 * Ignored when `static` is false. Default: 12.
	 */
	frame?: number;

	/**
	 * Mouse tracking. When true the shader receives a smoothed cursor
	 * position uniform and warps gently toward it. Pointer events are
	 * never captured — the canvas stays `pointer-events: none`.
	 * No-op on touch devices, under reduced motion, and when `static`.
	 * Default: false.
	 */
	interactive?: boolean;

	/**
	 * CSS `mix-blend-mode` for the canvas (e.g. `'screen'`,
	 * `'lighten'`, `'plus-lighter'`). Useful when layering an effect
	 * over imagery rather than a flat background. Default: 'normal'.
	 */
	blend?: string;

	/**
	 * Fade the effect out toward an edge with a CSS mask so it melts
	 * into the page background instead of ending at a hard line.
	 * Default: 'bottom' (heroes almost always want this).
	 */
	fade?: 'none' | 'bottom' | 'top' | 'both';
}

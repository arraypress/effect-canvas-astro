/**
 * @module @arraypress/effect-canvas-astro
 *
 * GPU shader background canvas for Astro. Mount `<EffectCanvas />` behind a
 * hero or section; it renders one of seven token-tinted WebGL effects
 * (aurora / mesh / waves / grid / particles / grain / liquid), derives its
 * colour from the live `--color-accent` CSS variable at mount, and is
 * reduced-motion + offscreen-pause safe with a CSS-gradient fallback when
 * WebGL is unavailable.
 *
 * ```astro
 * ---
 * import { EffectCanvas } from '@arraypress/effect-canvas-astro';
 * ---
 * <div class="relative">
 *   <EffectCanvas name="aurora" speed={0.6} intensity={0.7} />
 *   <div class="relative z-10">…content…</div>
 * </div>
 * ```
 */

import EffectCanvas from './EffectCanvas.astro';

export { EffectCanvas };
export type * from './types';
export default EffectCanvas;

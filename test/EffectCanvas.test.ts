import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import EffectCanvasRaw from '../src/EffectCanvas.astro';
import type { EffectConfig } from '../src/types';

const EffectCanvas = EffectCanvasRaw as Parameters<AstroContainer['renderToString']>[0];

let container: AstroContainer;

beforeAll(async () => {
	container = await AstroContainer.create();
});

async function render(props: EffectConfig): Promise<string> {
	return container.renderToString(EffectCanvas, {
		props: props as unknown as Record<string, unknown>,
	});
}

describe('<EffectCanvas>', () => {
	it('renders an aria-hidden canvas tagged with the effect name', async () => {
		const html = await render({ name: 'aurora' });
		expect(html).toContain('<canvas');
		expect(html).toContain('data-effect="aurora"');
		expect(html).toContain('aria-hidden="true"');
	});

	it('hoists a module mount script alongside the canvas', async () => {
		const html = await render({ name: 'mesh' });
		expect(html).toContain('<script');
		expect(html).toContain('type="module"');
	});

	it('passes speed + intensity through as data attributes', async () => {
		const html = await render({ name: 'waves', speed: 0.5, intensity: 0.8 });
		expect(html).toContain('data-effect-speed="0.5"');
		expect(html).toContain('data-effect-intensity="0.8"');
	});

	it('serialises explicit colours for the shader', async () => {
		const html = await render({ name: 'liquid', colors: ['#00e472', '#0d7377'], interactive: true });
		expect(html).toContain('data-effect-colors="#00e472,#0d7377"');
		expect(html).toContain('data-effect-interactive="on"');
	});

	it('marks a static canvas so the runtime skips the rAF loop', async () => {
		const html = await render({ name: 'mesh-gradient', static: true, frame: 14 });
		expect(html).toContain('data-effect-static="on"');
		expect(html).toContain('data-effect-frame="14"');
	});

	it('omits the static attributes when animating', async () => {
		const html = await render({ name: 'mesh-gradient' });
		expect(html).not.toContain('data-effect-static');
		expect(html).not.toContain('data-effect-frame');
	});

	it('drops interactivity on a static canvas', async () => {
		/* A frozen frame can't react to the cursor, so wiring the pointer
		 * listeners would cost work that can never show up. */
		const html = await render({ name: 'liquid', static: true, interactive: true });
		expect(html).not.toContain('data-effect-interactive');
	});

	it('renders the gradient effects', async () => {
		for (const name of ['mesh-gradient', 'grain-gradient'] as const) {
			const html = await render({ name });
			expect(html).toContain(`data-effect="${name}"`);
		}
	});

	it('serialises a fourth colour for the gradient shaders', async () => {
		const html = await render({
			name: 'mesh-gradient',
			colors: ['#ccff00', '#4d6100', '#00ffb3', '#ffee00'],
		});
		expect(html).toContain('data-effect-colors="#ccff00,#4d6100,#00ffb3,#ffee00"');
	});

	it('registers a shader body for every EffectName', async () => {
		/* The registry lives in the hoisted client script, so assert against
		 * the component source: a name in the union with no shader body would
		 * only fail at runtime, in the browser, as a console warning. */
		const src = await readFile(new URL('../src/EffectCanvas.astro', import.meta.url), 'utf8');
		const types = await readFile(new URL('../src/types.ts', import.meta.url), 'utf8');

		const union = types
			.slice(types.indexOf('export type EffectName'), types.indexOf(';', types.indexOf('export type EffectName')))
			.match(/'([a-z-]+)'/g)!
			.map((s: string) => s.replace(/'/g, ''));

		expect(union.length).toBe(9);
		for (const name of union) {
			/* Keys are bare (mesh:) or quoted ('mesh-gradient':) depending on
			 * whether the name is a valid identifier. */
			const declared = src.includes(`\n\t\t\t${name}: \``) || src.includes(`'${name}': \``);
			expect(declared, `no shader body for "${name}"`).toBe(true);
		}
	});
});

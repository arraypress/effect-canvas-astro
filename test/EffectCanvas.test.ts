import { describe, it, expect, beforeAll } from 'vitest';
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
});

import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blankProject } from './storage/projectStorage';
import { exportProjectFiles } from './exporter/generate';
import { TEMPLATES } from './templates';

describe('export verification (writes sample dist)', () => {
  it('produces portable dist with responsive css, animations, clean html', () => {
    const outDir = join(tmpdir(), 'webdesigner-export-verify');
    mkdirSync(outDir, { recursive: true });
    const blank = blankProject();
    const tplPage = TEMPLATES[2].buildPage();
    const proj = { ...blank, name: 'Acme Test', pages: [{ ...tplPage, slug: 'index' }] };
    const files = exportProjectFiles(proj);
    for (const f of files) writeFileSync(join(outDir, f.path), f.content);

    const html = readFileSync(join(outDir, 'index.html'), 'utf8');
    const css = readFileSync(join(outDir, 'styles.css'), 'utf8');
    const js = readFileSync(join(outDir, 'script.js'), 'utf8');

    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<main');
    expect(html).toContain('<h1');
    expect(html).toContain('alt=');
    expect(html).toContain('styles.css');
    expect(html).toContain('script.js');
    expect(html).not.toContain('/@vite/');
    expect(css).toContain('max-width: 1024px');
    expect(css).toContain('max-width: 640px');
    expect(css).toContain('data-anim');
    expect(js).toContain('IntersectionObserver');
    expect(css.length).toBeGreaterThan(500);
  });
});

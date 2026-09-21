import { describe, expect, it } from 'vitest';
import {
  ELEMENT_ICONS,
  iconBody,
  isKnownIconId,
  legacyContentToIconId,
  resolveElementIconId,
} from './iconSet';
import { createElement } from './definitions';
import { exportPageHtml } from '../exporter/generate';
import { blankProject } from '../storage/projectStorage';
import { TEMPLATES } from '../templates';

// Emoji / symbol ranges that must never appear in user-facing content output.
// (Written with escapes so this file itself stays emoji-free.)
const EMOJI_RE = new RegExp(
  '[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]',
  'u',
);

describe('icon set', () => {
  it('ships a non-empty set with unique ids and svg bodies', () => {
    expect(ELEMENT_ICONS.length).toBeGreaterThanOrEqual(20);
    const ids = ELEMENT_ICONS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const icon of ELEMENT_ICONS) {
      expect(icon.label).toBeTruthy();
      expect(icon.body).toContain('<');
      expect(EMOJI_RE.test(icon.body)).toBe(false);
    }
  });

  it('falls back to star for unknown ids', () => {
    expect(iconBody('nope')).toBe(iconBody('star'));
    expect(isKnownIconId('zap')).toBe(true);
    expect(isKnownIconId('nope')).toBe(false);
  });

  it('migrates legacy emoji content to icon ids', () => {
    expect(legacyContentToIconId('\u2605')).toBe('star');
    expect(legacyContentToIconId('\u26A1')).toBe('zap');
    expect(legacyContentToIconId(String.fromCodePoint(0x1f680))).toBe('rocket');
    expect(legacyContentToIconId(String.fromCodePoint(0x1f3a8))).toBe('palette');
    expect(legacyContentToIconId(String.fromCodePoint(0x1f4f1))).toBe('mobile');
    expect(legacyContentToIconId('hello')).toBe(null);
    expect(legacyContentToIconId(undefined)).toBe(null);
  });

  it('prefers props.icon over legacy content', () => {
    expect(resolveElementIconId('heart', '\u2605')).toBe('heart');
    expect(resolveElementIconId(undefined, '\u26A1')).toBe('zap');
    expect(resolveElementIconId(undefined, undefined)).toBe('star');
  });
});

describe('icon element integration', () => {
  it('defaults new icons to the star glyph id', () => {
    const node = createElement('icon');
    expect(node.props.icon).toBe('star');
  });

  it('exports icons as inline svg (no emoji)', () => {
    const project = blankProject();
    project.pages[0].root[0].children[0].children.push(createElement('icon', { props: { icon: 'zap' } }));
    const html = exportPageHtml(project, project.pages[0]);
    expect(html).toContain('<svg viewBox="0 0 24 24"');
    expect(html).toContain('role="img"');
    expect(EMOJI_RE.test(html)).toBe(false);
  });

  it('all templates render without emoji content', () => {
    for (const t of TEMPLATES) {
      const page = t.buildPage();
      const walk = (nodes: { content?: string; children: never[] }[]) => {
        for (const n of nodes) {
          if (n.content) expect(EMOJI_RE.test(n.content)).toBe(false);
          walk(n.children as never[]);
        }
      };
      walk(page.root as never[]);
    }
  });
});

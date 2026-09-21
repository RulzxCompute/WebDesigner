import { describe, expect, it } from 'vitest';
import { createElement, insertNode, removeNode, updateNode, countNodes } from './elements/definitions';
import { exportPageHtml, exportProjectFiles, validateProject } from './exporter/generate';
import { blankProject } from './storage/projectStorage';

describe('element system', () => {
  it('creates typed elements with defaults', () => {
    const h = createElement('heading');
    expect(h.type).toBe('heading');
    expect(h.content).toBeTruthy();
    expect(h.styles.desktop.fontSize).toBeTruthy();
    const btn = createElement('button');
    expect(btn.props.href).toBe('#');
  });

  it('inserts, updates, removes nodes', () => {
    const section = createElement('section');
    let root = insertNode([], section, null);
    expect(root).toHaveLength(1);
    const heading = createElement('heading', { content: 'Hi' });
    root = insertNode(root, heading, section.id);
    expect(root[0].children).toHaveLength(1);
    root = updateNode(root, heading.id, (n) => ({ ...n, content: 'Hello' }));
    expect(root[0].children[0].content).toBe('Hello');
    expect(countNodes(root)).toBe(2);
    root = removeNode(root, heading.id);
    expect(countNodes(root)).toBe(1);
  });
});

describe('exporter', () => {
  it('generates valid standalone html', () => {
    const project = blankProject();
    const html = exportPageHtml(project, project.pages[0]);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<h1');
    expect(html).toContain('styles.css');
    expect(html).toContain('script.js');
  });

  it('exports multi-file dist set', () => {
    const project = blankProject();
    const files = exportProjectFiles(project);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('index.html');
    expect(paths).toContain('styles.css');
    expect(paths).toContain('script.js');
    const css = files.find((f) => f.path === 'styles.css')?.content ?? '';
    expect(css).toContain('box-sizing');
    expect(css.length).toBeGreaterThan(200);
  });

  it('validates project shape', () => {
    expect(validateProject(blankProject()).ok).toBe(true);
    expect(validateProject(null).ok).toBe(false);
    expect(validateProject({}).ok).toBe(false);
  });

  it('escapes content safely', () => {
    const project = blankProject();
    project.pages[0].root[0].children[0].children[0].content = '<script>alert(1)</script>';
    const html = exportPageHtml(project, project.pages[0]);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

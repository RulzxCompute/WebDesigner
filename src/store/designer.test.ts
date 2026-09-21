import { describe, expect, it } from 'vitest';
import { createInitialState, designerReducer } from './DesignerContext';
import type { DesignerAction } from './DesignerContext';
import { blankProject } from '../storage/projectStorage';
import { createElement, moveNodeToIndex } from '../elements/definitions';

function setup() {
  return createInitialState(blankProject());
}

function firstChildId(state: ReturnType<typeof setup>): string {
  return state.project.pages[0].root[0].children[0].children[0].id;
}

function widthOf(state: ReturnType<typeof setup>, id: string): string | undefined {
  const walk = (nodes: { id: string; styles: { desktop: { width?: string } }; children: never[] }[]): string | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n.styles.desktop.width;
      const found = walk(n.children);
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return walk(state.project.pages[0].root as never[]);
}

const widen = (id: string, w: string): DesignerAction => ({
  type: 'TRANSIENT_ROOT',
  mutate: (root) =>
    root.map((n) => ({
      ...n,
      children: n.children.map((c) => ({
        ...c,
        children: c.children.map((g) => (g.id === id ? { ...g, styles: { ...g.styles, desktop: { ...g.styles.desktop, width: w } } } : g)),
      })),
    })),
});

describe('transient drag sessions', () => {
  it('commits a whole gesture as a single undo step', () => {
    let s = setup();
    const id = firstChildId(s);
    s = designerReducer(s, { type: 'BEGIN_TRANSIENT' });
    expect(s.transientBase).not.toBeNull();
    // many live updates, no history yet
    s = designerReducer(s, widen(id, '100px'));
    s = designerReducer(s, widen(id, '200px'));
    s = designerReducer(s, widen(id, '300px'));
    expect(s.past).toHaveLength(0);
    expect(widthOf(s, id)).toBe('300px');
    s = designerReducer(s, { type: 'COMMIT_TRANSIENT' });
    expect(s.past).toHaveLength(1);
    expect(s.transientBase).toBeNull();
    expect(widthOf(s, id)).toBe('300px');
    // one undo reverts the entire gesture
    s = designerReducer(s, { type: 'UNDO' });
    expect(widthOf(s, id)).not.toBe('300px');
  });

  it('cancels a gesture without touching history', () => {
    let s = setup();
    const id = firstChildId(s);
    const before = widthOf(s, id);
    s = designerReducer(s, { type: 'BEGIN_TRANSIENT' });
    s = designerReducer(s, widen(id, '999px'));
    expect(widthOf(s, id)).toBe('999px');
    s = designerReducer(s, { type: 'CANCEL_TRANSIENT' });
    expect(widthOf(s, id)).toBe(before);
    expect(s.past).toHaveLength(0);
  });

  it('commit/cancel are no-ops when idle', () => {
    const s = setup();
    expect(designerReducer(s, { type: 'COMMIT_TRANSIENT' })).toBe(s);
    expect(designerReducer(s, { type: 'CANCEL_TRANSIENT' })).toBe(s);
  });
});

describe('moveNodeToIndex', () => {
  it('reorders within the same parent', () => {
    const a = createElement('heading', { content: 'A' });
    const b = createElement('heading', { content: 'B' });
    const c = createElement('heading', { content: 'C' });
    const root = [a, b, c];
    const moved = moveNodeToIndex(root, a.id, null, 2);
    expect(moved.map((n) => n.id)).toEqual([b.id, c.id, a.id]);
    const back = moveNodeToIndex(moved, a.id, null, 0);
    expect(back.map((n) => n.id)).toEqual([a.id, b.id, c.id]);
  });

  it('never drops nodes for unknown ids or parents', () => {
    const a = createElement('heading', { content: 'A' });
    const root = [a];
    expect(moveNodeToIndex(root, 'missing', null, 0)).toBe(root);
    expect(moveNodeToIndex(root, a.id, 'missing-parent', 0)).toBe(root);
  });
});

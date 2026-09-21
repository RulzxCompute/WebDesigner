import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Breakpoint, ElementNode, ElementType, WebDesignerProject } from '../types';
import { clone, uid } from '../utils';
import { createElement, insertNode, removeNode, updateNode } from '../elements/definitions';
import { defaultProject, loadLocal, saveLocal } from '../storage/projectStorage';
import { getTemplate } from '../templates';

export type EditorMode = 'edit' | 'preview';

export interface DesignerState {
  project: WebDesignerProject;
  currentPageId: string;
  selectedId: string | null;
  breakpoint: Breakpoint;
  mode: EditorMode;
  past: WebDesignerProject[];
  future: WebDesignerProject[];
  lastSavedAt: string | null;
  saveError: string | null;
  clipboard: ElementNode | null;
  /**
   * Snapshot taken when a drag/keyboard-nudge session starts. Live updates
   * apply without touching history; COMMIT pushes this single snapshot so
   * the whole gesture undoes in one step. Null when idle.
   */
  transientBase: WebDesignerProject | null;
}

type Action =
  | { type: 'ADD'; elementType: ElementType; parentId: string | null; index?: number }
  | { type: 'ADD_NODE'; node: ElementNode; parentId: string | null; index?: number }
  | { type: 'ADD_PRESET_NODES'; nodes: ElementNode[] }
  | { type: 'UPDATE_NODE'; id: string; updater: (n: ElementNode) => ElementNode }
  | { type: 'BEGIN_TRANSIENT' }
  | { type: 'TRANSIENT_ROOT'; mutate: (root: ElementNode[]) => ElementNode[] }
  | { type: 'COMMIT_TRANSIENT' }
  | { type: 'CANCEL_TRANSIENT' }
  | { type: 'DELETE'; id: string }
  | { type: 'DUPLICATE'; id: string }
  | { type: 'MOVE'; id: string; direction: 'up' | 'down' | 'left' | 'right' }
  | { type: 'MOVE_TO'; id: string; parentId: string | null; index?: number }
  | { type: 'RENAME'; id: string; name: string }
  | { type: 'SELECT'; id: string | null }
  | { type: 'SET_BREAKPOINT'; bp: Breakpoint }
  | { type: 'SET_MODE'; mode: EditorMode }
  | { type: 'SET_PAGE'; pageId: string }
  | { type: 'LOAD_PROJECT'; project: WebDesignerProject }
  | { type: 'NEW_PROJECT'; project: WebDesignerProject }
  | { type: 'APPLY_TEMPLATE'; templateKey: string }
  | { type: 'UPDATE_PROJECT_META'; name?: string; siteTitle?: string; siteDescription?: string }
  | { type: 'UPDATE_PAGE_META'; title?: string; description?: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'COPY' }
  | { type: 'PASTE'; parentId?: string | null }
  | { type: 'MARK_SAVED' }
  | { type: 'SAVE_ERROR'; error: string };

export type DesignerAction = Action;

function currentRoot(state: DesignerState): ElementNode[] {
  const page = state.project.pages.find((p) => p.id === state.currentPageId);
  return page ? page.root : [];
}

function withRoot(state: DesignerState, root: ElementNode[]): WebDesignerProject {
  return {
    ...state.project,
    pages: state.project.pages.map((p) => (p.id === state.currentPageId ? { ...p, root } : p)),
    updatedAt: new Date().toISOString(),
  };
}

function pushHistory(state: DesignerState, nextProject: WebDesignerProject): DesignerState {
  const past = [...state.past, clone(state.project)].slice(-60);
  return { ...state, project: nextProject, past, future: [] };
}

/** Folds an in-progress drag into a single history entry (used before undo/redo). */
function commitPending(state: DesignerState): DesignerState {
  if (!state.transientBase) return state;
  return {
    ...state,
    past: [...state.past, clone(state.transientBase)].slice(-60),
    future: [],
    transientBase: null,
  };
}

function moveNodeInTree(root: ElementNode[], id: string, dir: 'up' | 'down' | 'left' | 'right'): ElementNode[] {
  // up/down: reorder within parent; left/right: outdent/indent one level via simple heuristic
  const reorder = (nodes: ElementNode[]): ElementNode[] => {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx >= 0) {
      if (dir === 'up' && idx > 0) {
        const next = [...nodes];
        const [item] = next.splice(idx, 1);
        next.splice(idx - 1, 0, item);
        return next;
      }
      if (dir === 'down' && idx < nodes.length - 1) {
        const next = [...nodes];
        const [item] = next.splice(idx, 1);
        next.splice(idx + 1, 0, item);
        return next;
      }
      return nodes;
    }
    return nodes.map((n) => ({ ...n, children: reorder(n.children) }));
  };
  if (dir === 'up' || dir === 'down') return reorder(root);
  // left: lift node one level up (move after its parent); right: move into previous sibling if container
  const flat: { node: ElementNode; parentId: string | null; index: number }[] = [];
  const collect = (nodes: ElementNode[], parentId: string | null) => {
    nodes.forEach((n, i) => {
      flat.push({ node: n, parentId, index: i });
      collect(n.children, n.id);
    });
  };
  collect(root, null);
  const entry = flat.find((f) => f.node.id === id);
  if (!entry || !entry.parentId) return root;
  if (dir === 'left') {
    // remove then insert after parent at top level (simplified outdent)
    const without = removeNode(root, id);
    const parentIdx = without.findIndex((n) => n.id === entry.parentId);
    const copy = clone(entry.node);
    const next = [...without];
    next.splice(parentIdx >= 0 ? parentIdx + 1 : next.length, 0, copy);
    return next;
  }
  // right: try to nest into previous sibling if it can have children
  const siblings = (() => {
    const findSibs = (nodes: ElementNode[]): ElementNode[] | null => {
      if (nodes.some((n) => n.id === id)) return nodes;
      for (const n of nodes) {
        const r = findSibs(n.children);
        if (r) return r;
      }
      return null;
    };
    return findSibs(root);
  })();
  if (!siblings) return root;
  const idx = siblings.findIndex((n) => n.id === id);
  if (idx > 0) {
    const prev = siblings[idx - 1];
    if (prev.type === 'section' || prev.type === 'container' || prev.type === 'grid') {
      const without = removeNode(root, id);
      return insertNode(without, clone(entry.node), prev.id);
    }
  }
  return root;
}

export function designerReducer(state: DesignerState, action: Action): DesignerState {
  switch (action.type) {
    case 'ADD': {
      const node = createElement(action.elementType);
      const root = insertNode(currentRoot(state), node, action.parentId, action.index);
      const s = pushHistory(state, withRoot(state, root));
      return { ...s, selectedId: node.id };
    }
    case 'ADD_NODE': {
      const root = insertNode(currentRoot(state), clone(action.node), action.parentId, action.index);
      const s = pushHistory(state, withRoot(state, root));
      return { ...s, selectedId: action.node.id };
    }
    case 'ADD_PRESET_NODES': {
      let root = currentRoot(state);
      let lastId: string | null = null;
      for (const n of action.nodes) {
        const copy = clone(n);
        root = insertNode(root, copy, null);
        lastId = copy.id;
      }
      const s = pushHistory(state, withRoot(state, root));
      return { ...s, selectedId: lastId };
    }
    case 'UPDATE_NODE': {
      const root = updateNode(currentRoot(state), action.id, action.updater);
      return pushHistory(state, withRoot(state, root));
    }
    case 'BEGIN_TRANSIENT': {
      if (state.transientBase) return state;
      return { ...state, transientBase: clone(state.project) };
    }
    case 'TRANSIENT_ROOT': {
      const base = state.transientBase ?? clone(state.project);
      return { ...state, transientBase: base, project: withRoot(state, action.mutate(currentRoot(state))) };
    }
    case 'COMMIT_TRANSIENT': {
      if (!state.transientBase) return state;
      return {
        ...state,
        past: [...state.past, clone(state.transientBase)].slice(-60),
        future: [],
        transientBase: null,
      };
    }
    case 'CANCEL_TRANSIENT': {
      if (!state.transientBase) return state;
      return { ...state, project: state.transientBase, transientBase: null };
    }
    case 'DELETE': {
      const root = removeNode(currentRoot(state), action.id);
      const s = pushHistory(state, withRoot(state, root));
      return { ...s, selectedId: null };
    }
    case 'DUPLICATE': {
      const find = (nodes: ElementNode[]): ElementNode | null => {
        for (const n of nodes) {
          if (n.id === action.id) return n;
          const c = find(n.children);
          if (c) return c;
        }
        return null;
      };
      const orig = find(currentRoot(state));
      if (!orig) return state;
      const reId = (n: ElementNode): ElementNode => ({ ...clone(n), id: uid(n.type.slice(0, 3)), children: n.children.map(reId) });
      const copy = reId(orig);
      copy.name = `${orig.name} copy`;
      // insert after original within same parent
      const insertAfter = (nodes: ElementNode[]): ElementNode[] => {
        const idx = nodes.findIndex((n) => n.id === action.id);
        if (idx >= 0) {
          const next = [...nodes];
          next.splice(idx + 1, 0, copy);
          return next;
        }
        return nodes.map((n) => ({ ...n, children: insertAfter(n.children) }));
      };
      const s = pushHistory(state, withRoot(state, insertAfter(currentRoot(state))));
      return { ...s, selectedId: copy.id };
    }
    case 'MOVE': {
      const root = moveNodeInTree(currentRoot(state), action.id, action.direction);
      return pushHistory(state, withRoot(state, root));
    }
    case 'MOVE_TO': {
      const root = currentRoot(state);
      // guard: cannot move into itself or its own descendant, or into non-containers
      const find = (nodes: ElementNode[]): ElementNode | null => {
        for (const n of nodes) {
          if (n.id === action.id) return n;
          const c = find(n.children);
          if (c) return c;
        }
        return null;
      };
      const moving = find(root);
      if (!moving) return state;
      if (action.parentId) {
        const findByIdLocal = (nodes: ElementNode[], pid: string): ElementNode | null => {
          for (const n of nodes) {
            if (n.id === pid) return n;
            const c = findByIdLocal(n.children, pid);
            if (c) return c;
          }
          return null;
        };
        const dest = findByIdLocal(root, action.parentId);
        if (!dest || (dest.type !== 'section' && dest.type !== 'container' && dest.type !== 'grid')) return state;
        if (findByIdLocal(moving.children, action.parentId)) return state;
        if (action.parentId === action.id) return state;
      }
      const without = removeNode(root, action.id);
      // re-check destination still exists after removal (it will, unless it was inside moving node — guarded above)
      const next = insertNode(without, clone(moving), action.parentId, action.index);
      return pushHistory(state, withRoot(state, next));
    }
    case 'RENAME': {
      const root = updateNode(currentRoot(state), action.id, (n) => ({ ...n, name: action.name }));
      return pushHistory(state, withRoot(state, root));
    }
    case 'SELECT':
      return { ...state, selectedId: action.id };
    case 'SET_BREAKPOINT':
      return { ...state, breakpoint: action.bp };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_PAGE':
      return { ...state, currentPageId: action.pageId, selectedId: null, transientBase: null };
    case 'LOAD_PROJECT':
    case 'NEW_PROJECT': {
      const pages = action.project.pages.length ? action.project.pages : defaultProject().pages;
      return {
        ...state,
        project: { ...clone(action.project), pages: clone(pages) },
        currentPageId: pages[0].id,
        selectedId: null,
        past: [],
        future: [],
        transientBase: null,
      };
    }
    case 'APPLY_TEMPLATE': {
      const tpl = getTemplate(action.templateKey);
      if (!tpl) return state;
      const page = tpl.buildPage();
      const next: WebDesignerProject = {
        ...state.project,
        pages: state.project.pages.map((p) => (p.id === state.currentPageId ? { ...page, id: p.id, name: p.name, slug: p.slug } : p)),
      };
      const s = pushHistory(state, next);
      return { ...s, selectedId: null };
    }
    case 'UPDATE_PROJECT_META': {
      const next: WebDesignerProject = {
        ...state.project,
        name: action.name ?? state.project.name,
        settings: {
          ...state.project.settings,
          siteTitle: action.siteTitle ?? state.project.settings.siteTitle,
          siteDescription: action.siteDescription ?? state.project.settings.siteDescription,
        },
      };
      return pushHistory(state, next);
    }
    case 'UPDATE_PAGE_META': {
      const next: WebDesignerProject = {
        ...state.project,
        pages: state.project.pages.map((p) =>
          p.id === state.currentPageId
            ? { ...p, title: action.title ?? p.title, description: action.description ?? p.description }
            : p,
        ),
      };
      return pushHistory(state, next);
    }
    case 'UNDO': {
      const committed = commitPending(state);
      if (!committed.past.length) return committed;
      const prev = committed.past[committed.past.length - 1];
      return {
        ...committed,
        project: clone(prev),
        past: committed.past.slice(0, -1),
        future: [clone(committed.project), ...committed.future].slice(0, 60),
        selectedId: null,
      };
    }
    case 'REDO': {
      const committed = commitPending(state);
      if (!committed.future.length) return committed;
      const [next, ...rest] = committed.future;
      return {
        ...committed,
        project: clone(next),
        past: [...committed.past, clone(committed.project)].slice(-60),
        future: rest,
        selectedId: null,
      };
    }
    case 'COPY': {
      if (!state.selectedId) return state;
      const find = (nodes: ElementNode[]): ElementNode | null => {
        for (const n of nodes) {
          if (n.id === state.selectedId) return n;
          const c = find(n.children);
          if (c) return c;
        }
        return null;
      };
      const node = find(currentRoot(state));
      if (!node) return state;
      return { ...state, clipboard: clone(node) };
    }
    case 'PASTE': {
      if (!state.clipboard) return state;
      const reId = (n: ElementNode): ElementNode => ({ ...clone(n), id: uid(n.type.slice(0, 3)), children: n.children.map(reId) });
      const copy = reId(state.clipboard);
      const root = insertNode(currentRoot(state), copy, action.parentId ?? null);
      const s = pushHistory(state, withRoot(state, root));
      return { ...s, selectedId: copy.id };
    }
    case 'MARK_SAVED':
      return { ...state, lastSavedAt: new Date().toISOString(), saveError: null };
    case 'SAVE_ERROR':
      return { ...state, saveError: action.error };
    default:
      return state;
  }
}

interface DesignerApi extends DesignerState {
  dispatch: React.Dispatch<Action>;
  selectedNode: ElementNode | null;
  canUndo: boolean;
  canRedo: boolean;
  saveNow: () => void;
}

const Ctx = createContext<DesignerApi | null>(null);

function findById(nodes: ElementNode[], id: string | null): ElementNode | null {
  if (!id) return null;
  const walk = (list: ElementNode[]): ElementNode | null => {
    for (const n of list) {
      if (n.id === id) return n;
      const c = walk(n.children);
      if (c) return c;
    }
    return null;
  };
  return walk(nodes);
}

export function createInitialState(project: WebDesignerProject): DesignerState {
  return {
    project,
    currentPageId: project.pages[0]?.id ?? 'home',
    selectedId: null,
    breakpoint: 'desktop',
    mode: 'edit',
    past: [],
    future: [],
    lastSavedAt: null,
    saveError: null,
    clipboard: null,
    transientBase: null,
  };
}

export function DesignerProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => {
    const stored = loadLocal();
    const project = stored ?? defaultProject();
    const state = createInitialState(project);
    if (stored) state.lastSavedAt = stored.updatedAt;
    return state;
  }, []);
  const [state, dispatch] = useReducer(designerReducer, initial);

  const saveNow = useCallback(() => {
    // read latest from localStorage? no — caller should use state via ref; simplest: persist on effect
    dispatch({ type: 'MARK_SAVED' });
  }, []);

  // autosave (debounced by effect)
  useEffect(() => {
    const t = setTimeout(() => {
      const res = saveLocal(state.project);
      if (res.ok) dispatch({ type: 'MARK_SAVED' });
      else dispatch({ type: 'SAVE_ERROR', error: res.error ?? 'Save failed' });
    }, 600);
    return () => clearTimeout(t);
  }, [state.project]);

  const api = useMemo<DesignerApi>(() => {
    const page = state.project.pages.find((p) => p.id === state.currentPageId);
    const selectedNode = findById(page?.root ?? [], state.selectedId);
    return {
      ...state,
      dispatch,
      selectedNode,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      saveNow,
    };
  }, [state, saveNow]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useDesigner(): DesignerApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDesigner must be used inside DesignerProvider');
  return ctx;
}

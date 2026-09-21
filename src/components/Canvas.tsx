import { useRef, useState } from 'react';
import { useDesigner } from '../store/DesignerContext';
import type { ElementNode } from '../types';
import { resolveStyle } from './RenderNode';
import {
  canHaveChildren,
  SECTION_PRESETS,
  createElement,
  findParentId,
  moveNodeToIndex,
  updateNode,
} from '../elements/definitions';
import { resolveElementIconId } from '../elements/iconSet';
import { ElementIcon, UiIcon } from './icons';
import { clone } from '../utils';

const MIN_W = 24;
const MIN_H = 12;
const SNAP = 8;

function px(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec((value ?? '').trim());
  return m ? parseFloat(m[1]) : 0;
}

interface DragSession {
  kind: 'resize' | 'free' | 'reorder' | 'keys';
  axis?: 'x' | 'y' | 'both';
  parentId?: string | null;
  startX: number;
  startY: number;
  baseW: number;
  baseH: number;
  baseTop: number;
  baseLeft: number;
  aspect: number;
  startIndex: number;
  lastApplied: number;
  lastW: number;
  lastH: number;
  lastTop: number;
  lastLeft: number;
  moved: boolean;
  cleanup?: () => void;
}

export default function Canvas() {
  const { project, currentPageId, selectedId, breakpoint, dispatch } = useDesigner();
  const page = project.pages.find((p) => p.id === currentPageId);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  if (!page) return <div className="canvas-empty">No page</div>;

  const width = breakpoint === 'desktop' ? '100%' : breakpoint === 'tablet' ? '768px' : '375px';

  const handleDropOnRoot = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/x-webdesigner') || '{}');
      if (data.kind === 'element' && data.elementType) {
        // if a container is selected, nest inside it; else append to root
        const sel = findNode(page.root, selectedId);
        const parentId = sel && canHaveChildren(sel.type) ? sel.id : null;
        dispatch({ type: 'ADD', elementType: data.elementType, parentId });
      } else if (data.kind === 'preset' && data.presetKey) {
        const preset = SECTION_PRESETS.find((p) => p.key === data.presetKey);
        if (preset) dispatch({ type: 'ADD_PRESET_NODES', nodes: preset.build() });
      }
    } catch { /* ignore invalid drops */ }
  };

  return (
    <div className="canvas-wrap">
      <div className="canvas-device-label">{breakpoint} — {width === '100%' ? 'fluid' : width}</div>
      <div
        className={`canvas breakpoint-${breakpoint}`}
        style={{ maxWidth: width }}
        onDragOver={(e) => {
          e.preventDefault();
          setDropTarget('root');
        }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={handleDropOnRoot}
        onClick={(e) => {
          if (e.target === e.currentTarget) dispatch({ type: 'SELECT', id: null });
        }}
      >
        {page.root.length === 0 && (
          <div className="canvas-drop-hint">Drop elements here or click items in the left panel.<br />Start with a Section → Container → Heading + Button.</div>
        )}
        {page.root.map((n) => (
          <CanvasNode key={n.id} node={n} dropTarget={dropTarget} setDropTarget={setDropTarget} />
        ))}
      </div>
    </div>
  );
}

function findNode(nodes: ElementNode[], id: string | null): ElementNode | null {
  if (!id) return null;
  for (const n of nodes) {
    if (n.id === id) return n;
    const c = findNode(n.children, id);
    if (c) return c;
  }
  return null;
}

function CanvasNode({ node, dropTarget, setDropTarget }: { node: ElementNode; dropTarget: string | null; setDropTarget: (v: string | null) => void }) {
  const { project, currentPageId, breakpoint, selectedId, dispatch } = useDesigner();
  const selected = selectedId === node.id;
  const style = resolveStyle(node, breakpoint);
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.content ?? '');
  const [dragging, setDragging] = useState(false);
  const [liveLabel, setLiveLabel] = useState<string | null>(null);
  const dragRef = useRef<DragSession | null>(null);

  const page = project.pages.find((p) => p.id === currentPageId);
  const root: ElementNode[] = page ? page.root : [];
  const isTextLike = node.type === 'heading' || node.type === 'text' || node.type === 'paragraph' || node.type === 'button' || node.type === 'link';
  const containerLike = canHaveChildren(node.type);
  const isAbsolute = node.styles[breakpoint]?.position === 'absolute' || node.styles.desktop?.position === 'absolute';

  const onDropHere = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/x-webdesigner') || '{}');
      if (data.kind === 'element' && data.elementType && containerLike) {
        const el = createElement(data.elementType);
        dispatch({ type: 'ADD_NODE', node: el, parentId: node.id });
      } else if (data.kind === 'preset' && data.presetKey) {
        const preset = SECTION_PRESETS.find((p) => p.key === data.presetKey);
        if (preset) {
          for (const n of preset.build()) {
            const copy = clone(n);
            dispatch({ type: 'ADD_NODE', node: copy, parentId: null });
          }
        }
      }
    } catch { /* ignore */ }
  };

  /** Ends the active gesture: one history entry when something changed, none otherwise. */
  const finishDrag = (commit: boolean) => {
    const s = dragRef.current;
    if (!s) return;
    dragRef.current = null;
    if (s.cleanup) {
      s.cleanup();
      s.cleanup = undefined;
    }
    setDragging(false);
    setLiveLabel(null);
    document.body.classList.remove('wd-dragging');
    dispatch({ type: commit && s.moved ? 'COMMIT_TRANSIENT' : 'CANCEL_TRANSIENT' });
  };

  const measureSiblings = (): { id: string; mid: number }[] => {
    const parent = ref.current?.parentElement;
    if (!parent) return [];
    return Array.from(parent.querySelectorAll(':scope > .wd-node'))
      .map((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return { id: (el as HTMLElement).dataset.id ?? '', mid: r.top + r.height / 2 };
      })
      .filter((k) => k.id !== '');
  };

  const beginResize = (axis: 'x' | 'y' | 'both') => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    if (!el || dragRef.current) return;
    dispatch({ type: 'BEGIN_TRANSIENT' });
    const baseW = Math.max(MIN_W, Math.round(el.offsetWidth));
    const baseH = Math.max(MIN_H, Math.round(el.offsetHeight));
    const s: DragSession = {
      kind: 'resize', axis,
      startX: e.clientX, startY: e.clientY,
      baseW, baseH, baseTop: 0, baseLeft: 0,
      aspect: baseW / Math.max(1, baseH),
      startIndex: -1, lastApplied: -1,
      lastW: baseW, lastH: baseH, lastTop: 0, lastLeft: 0, moved: false,
    };
    dragRef.current = s;
    setDragging(true);
    document.body.classList.add('wd-dragging');

    const onMove = (ev: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur) return;
      const dx = ev.clientX - cur.startX;
      const dy = ev.clientY - cur.startY;
      let w = cur.baseW;
      let h = cur.baseH;
      if (cur.axis === 'x' || cur.axis === 'both') w = Math.max(MIN_W, Math.round(cur.baseW + dx));
      if (cur.axis === 'y' || cur.axis === 'both') h = Math.max(MIN_H, Math.round(cur.baseH + dy));
      if (ev.shiftKey && node.type === 'image') {
        // Shift locks the aspect ratio for images.
        if (cur.axis === 'both') {
          if (Math.abs(dx) >= Math.abs(dy)) h = Math.max(MIN_H, Math.round(w / cur.aspect));
          else w = Math.max(MIN_W, Math.round(h * cur.aspect));
        } else if (cur.axis === 'x') {
          h = Math.max(MIN_H, Math.round(w / cur.aspect));
        } else {
          w = Math.max(MIN_W, Math.round(h * cur.aspect));
        }
      }
      if (w !== cur.baseW || h !== cur.baseH) cur.moved = true;
      if (w === cur.lastW && h === cur.lastH) return;
      cur.lastW = w;
      cur.lastH = h;
      const patch: Record<string, string> = {};
      if (cur.axis === 'x' || cur.axis === 'both') patch.width = `${w}px`;
      if (cur.axis === 'y' || cur.axis === 'both') patch.height = `${h}px`;
      const bp = breakpoint;
      dispatch({
        type: 'TRANSIENT_ROOT',
        mutate: (rt) => updateNode(rt, node.id, (n) => ({ ...n, styles: { ...n.styles, [bp]: { ...n.styles[bp], ...patch } } })),
      });
      setLiveLabel(`${w} × ${h}`);
    };
    const onUp = () => finishDrag(true);
    const onCancel = () => finishDrag(false);
    s.cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  };

  const beginMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current || !ref.current) return;
    dispatch({ type: 'BEGIN_TRANSIENT' });

    if (isAbsolute) {
      const s: DragSession = {
        kind: 'free',
        startX: e.clientX, startY: e.clientY,
        baseW: 0, baseH: 0,
        baseTop: px(style.top), baseLeft: px(style.left),
        aspect: 1, startIndex: -1, lastApplied: -1,
        lastW: 0, lastH: 0, lastTop: px(style.top), lastLeft: px(style.left), moved: false,
      };
      dragRef.current = s;
      setDragging(true);
      document.body.classList.add('wd-dragging');
      const onMove = (ev: PointerEvent) => {
        const cur = dragRef.current;
        if (!cur) return;
        let l = Math.round(cur.baseLeft + (ev.clientX - cur.startX));
        let t = Math.round(cur.baseTop + (ev.clientY - cur.startY));
        if (ev.shiftKey) {
          l = Math.round(l / SNAP) * SNAP;
          t = Math.round(t / SNAP) * SNAP;
        }
        if (l !== cur.baseLeft || t !== cur.baseTop) cur.moved = true;
        if (l === cur.lastLeft && t === cur.lastTop) return;
        cur.lastLeft = l;
        cur.lastTop = t;
        const bp = breakpoint;
        dispatch({
          type: 'TRANSIENT_ROOT',
          mutate: (rt) =>
            updateNode(rt, node.id, (n) => ({
              ...n,
              styles: { ...n.styles, [bp]: { ...n.styles[bp], left: `${l}px`, top: `${t}px` } },
            })),
        });
        setLiveLabel(`x ${l} · y ${t}`);
      };
      const onUp = () => finishDrag(true);
      const onCancel = () => finishDrag(false);
      s.cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    } else {
      // Static elements: vertical drag reorders within the same parent.
      const parentId = findParentId(root, node.id) ?? null;
      const startOrder = measureSiblings();
      const startIndex = Math.max(0, startOrder.findIndex((k) => k.id === node.id));
      const s: DragSession = {
        kind: 'reorder', parentId,
        startX: e.clientX, startY: e.clientY,
        baseW: 0, baseH: 0, baseTop: 0, baseLeft: 0, aspect: 1,
        startIndex, lastApplied: startIndex,
        lastW: 0, lastH: 0, lastTop: 0, lastLeft: 0, moved: false,
      };
      dragRef.current = s;
      setDragging(true);
      document.body.classList.add('wd-dragging');
      const onMove = (ev: PointerEvent) => {
        const cur = dragRef.current;
        if (!cur) return;
        const kids = measureSiblings();
        if (!kids.length) return;
        let target = 0;
        for (const k of kids) {
          if (k.id !== node.id && ev.clientY > k.mid) target++;
        }
        target = Math.max(0, Math.min(kids.length - 1, target));
        if (target === cur.lastApplied) return;
        cur.lastApplied = target;
        cur.moved = target !== cur.startIndex;
        const pid = cur.parentId ?? null;
        dispatch({ type: 'TRANSIENT_ROOT', mutate: (rt) => moveNodeToIndex(rt, node.id, pid, target) });
        setLiveLabel(`${target + 1} of ${kids.length}`);
      };
      const onUp = () => finishDrag(true);
      const onCancel = () => finishDrag(false);
      s.cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    }
  };

  const onNodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dispatch({ type: 'SELECT', id: node.id });
      return;
    }
    if (!selected || !e.key.startsWith('Arrow')) return;
    e.preventDefault();
    e.stopPropagation();
    const step = e.shiftKey ? 10 : 1;
    let s = dragRef.current;
    if (!s) {
      dispatch({ type: 'BEGIN_TRANSIENT' });
      s = {
        kind: 'keys',
        startX: 0, startY: 0, baseW: 0, baseH: 0, baseTop: 0, baseLeft: 0, aspect: 1,
        startIndex: -1, lastApplied: -1,
        lastW: 0, lastH: 0, lastTop: 0, lastLeft: 0, moved: false,
      };
      dragRef.current = s;
      const onKeysUp = () => finishDrag(true);
      s.cleanup = () => window.removeEventListener('keyup', onKeysUp);
      window.addEventListener('keyup', onKeysUp);
    }
    if (isAbsolute) {
      // Relative updater: safe under key-repeat batching.
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const bp = breakpoint;
      dispatch({
        type: 'TRANSIENT_ROOT',
        mutate: (rt) =>
          updateNode(rt, node.id, (n) => ({
            ...n,
            styles: {
              ...n.styles,
              [bp]: {
                ...n.styles[bp],
                top: `${px(n.styles[bp]?.top ?? n.styles.desktop?.top) + dy}px`,
                left: `${px(n.styles[bp]?.left ?? n.styles.desktop?.left) + dx}px`,
              },
            },
          })),
      });
      s.moved = true;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const dir = e.key === 'ArrowUp' ? -1 : 1;
      const order = measureSiblings();
      const idx = order.findIndex((k) => k.id === node.id);
      const next = Math.max(0, Math.min(order.length - 1, idx + dir));
      if (idx < 0 || next === idx) return;
      const pid = findParentId(root, node.id) ?? null;
      dispatch({ type: 'TRANSIENT_ROOT', mutate: (rt) => moveNodeToIndex(rt, node.id, pid, next) });
      s.moved = true;
    }
  };

  const inner = renderInner(node, editing, draft, setDraft, () => {
    setEditing(false);
    if (draft !== node.content) {
      const v = draft;
      dispatch({ type: 'UPDATE_NODE', id: node.id, updater: (n) => ({ ...n, content: v }) });
    }
  }, dropTarget, setDropTarget);

  return (
    <div
      ref={ref}
      className={`wd-node${selected ? ' selected' : ''}${containerLike ? ' is-container' : ''}${dropTarget === node.id ? ' drop-target' : ''}${dragging ? ' dragging' : ''}`}
      style={style}
      data-id={node.id}
      data-type={node.type}
      tabIndex={0}
      role="button"
      aria-label={`${node.name} (${node.type}). Press Enter to select.`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT', id: node.id });
      }}
      onKeyDown={onNodeKeyDown}
      onDoubleClick={(e) => {
        if (isTextLike) {
          e.stopPropagation();
          setDraft(node.content ?? '');
          setEditing(true);
        }
      }}
      onDragOver={containerLike ? (e) => { e.preventDefault(); e.stopPropagation(); setDropTarget(node.id); } : undefined}
      onDragLeave={containerLike ? (e) => { e.stopPropagation(); setDropTarget(null); } : undefined}
      onDrop={containerLike ? onDropHere : undefined}
      title={`${node.name} (${node.type}) — drag the move handle to ${isAbsolute ? 'move (Shift snaps)' : 'reorder'}, drag edges to resize`}
    >
      {editing && isTextLike ? (
        <input
          autoFocus
          className="inline-edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            setEditing(false);
            if (draft !== node.content) {
              const v = draft;
              dispatch({ type: 'UPDATE_NODE', id: node.id, updater: (n) => ({ ...n, content: v }) });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        inner
      )}
      {selected && (
        <div className="node-overlay" onClick={(e) => e.stopPropagation()}>
          {liveLabel ? (
            <span className="size-badge">{liveLabel}</span>
          ) : (
            <span className="node-tag">{node.name}</span>
          )}
          <span className="node-btns">
            <button title="Move up" aria-label="Move up" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'up' })}><UiIcon name="arrowUp" size={14} /></button>
            <button title="Move down" aria-label="Move down" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'down' })}><UiIcon name="arrowDown" size={14} /></button>
            <button title="Indent / nest" aria-label="Indent" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'right' })}><UiIcon name="arrowRight" size={14} /></button>
            <button title="Outdent" aria-label="Outdent" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'left' })}><UiIcon name="arrowLeft" size={14} /></button>
            <button title="Duplicate (Ctrl+D)" aria-label="Duplicate" onClick={() => dispatch({ type: 'DUPLICATE', id: node.id })}><UiIcon name="copy" size={14} /></button>
            <button title="Delete (Del)" aria-label="Delete" onClick={() => dispatch({ type: 'DELETE', id: node.id })}><UiIcon name="trash" size={14} /></button>
            <button
              title={isAbsolute ? 'Drag to move (hold Shift to snap)' : 'Drag up / down to reorder'}
              aria-label={isAbsolute ? 'Drag to move' : 'Drag to reorder'}
              className="move-handle"
              onPointerDown={beginMove}
            ><UiIcon name="move" size={14} /></button>
          </span>
        </div>
      )}
      {selected && (
        <>
          <span className="resize-handle east" title="Drag to resize width" onPointerDown={beginResize('x')} />
          <span className="resize-handle south" title="Drag to resize height" onPointerDown={beginResize('y')} />
          <span className="resize-handle corner" title="Drag to resize (Shift locks image ratio)" onPointerDown={beginResize('both')}><UiIcon name="resize" size={10} /></span>
        </>
      )}
    </div>
  );
}

function renderInner(
  node: ElementNode,
  _editing: boolean,
  _draft: string,
  _setDraft: (v: string) => void,
  _commit: () => void,
  dropTarget: string | null,
  setDropTarget: (v: string | null) => void,
) {
  const kids = node.children.map((c) => <CanvasNode key={c.id} node={c} dropTarget={dropTarget} setDropTarget={setDropTarget} />);
  switch (node.type) {
    case 'section':
    case 'container':
    case 'grid':
      return <>{kids.length ? kids : <span className="empty-box">Empty {node.type} — drop elements here</span>}</>;
    case 'heading': {
      const L = Math.min(6, Math.max(1, node.props.level ?? 2));
      const txt = node.content || 'Heading';
      if (L === 1) return <h1 className="reset">{txt}</h1>;
      if (L === 3) return <h3 className="reset">{txt}</h3>;
      return <h2 className="reset">{txt}</h2>;
    }
    case 'text':
    case 'paragraph':
      return <p className="reset">{node.content}</p>;
    case 'button':
      return <span className="as-button">{node.content}</span>;
    case 'link':
      return <span className="as-link">{node.content}</span>;
    case 'image':
      return node.props.src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          src={node.props.src}
          alt={node.props.alt || node.name}
          style={{ width: '100%', height: 'auto', borderRadius: 'inherit', display: 'block' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="sans-serif">Image not found</text></svg>');
          }}
        />
      ) : (
        <span className="empty-box">No image source</span>
      );
    case 'divider':
      return <span className="divider-line" />;
    case 'spacer':
      return <span className="spacer-line"><UiIcon name="spacer" size={12} /> {node.styles.desktop?.height || '32px'}</span>;
    case 'icon':
      return <ElementIcon id={resolveElementIconId(node.props.icon, node.content)} />;
    default:
      return <span>{node.content}</span>;
  }
}

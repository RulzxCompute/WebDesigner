import { useRef, useState } from 'react';
import { useDesigner } from '../store/DesignerContext';
import type { ElementNode } from '../types';
import { resolveStyle } from './RenderNode';
import { canHaveChildren, SECTION_PRESETS, createElement } from '../elements/definitions';
import { clone } from '../utils';

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
  const { breakpoint, selectedId, dispatch } = useDesigner();
  const selected = selectedId === node.id;
  const style = resolveStyle(node, breakpoint);
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.content ?? '');
  const resizeStart = useRef<{ x: number; y: number; w: string | undefined; h: string | undefined } | null>(null);
  const moveStart = useRef<{ x: number; y: number; top: string | undefined; left: string | undefined } | null>(null);

  const isTextLike = node.type === 'heading' || node.type === 'text' || node.type === 'paragraph' || node.type === 'button' || node.type === 'link' || node.type === 'icon';
  const containerLike = canHaveChildren(node.type);

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

  const beginResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: style.width as string | undefined, h: style.height as string | undefined };
    const onMove = (ev: PointerEvent) => {
      const s = resizeStart.current;
      if (!s) return;
      const dx = ev.clientX - s.x;
      const dy = ev.clientY - s.y;
      const parse = (v: string | undefined, fallback: number) => {
        if (!v) return fallback;
        const m = /^(\d+(?:\.\d+)?)px$/.exec(v.trim());
        return m ? parseFloat(m[1]) : fallback;
      };
      const baseW = parse(typeof s.w === 'string' ? s.w : undefined, ref.current?.offsetWidth ?? 200);
      const baseH = parse(typeof s.h === 'string' ? s.h : undefined, ref.current?.offsetHeight ?? 60);
      const nextW = `${Math.max(24, Math.round(baseW + dx))}px`;
      const nextH = `${Math.max(16, Math.round(baseH + dy))}px`;
      dispatch({
        type: 'UPDATE_NODE',
        id: node.id,
        updater: (n) => ({ ...n, styles: { ...n.styles, [breakpoint]: { ...n.styles[breakpoint], width: nextW, height: node.type === 'spacer' || node.type === 'image' || containerLike ? nextH : n.styles[breakpoint]?.height } } }),
      });
    };
    const onUp = () => {
      resizeStart.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const beginMove = (e: React.PointerEvent) => {
    if (node.styles[breakpoint]?.position !== 'absolute' && node.styles.desktop?.position !== 'absolute') return;
    e.stopPropagation();
    e.preventDefault();
    moveStart.current = { x: e.clientX, y: e.clientY, top: style.top as string | undefined, left: style.left as string | undefined };
    const parse = (v: string | undefined) => {
      if (!v) return 0;
      const m = /^(-?\d+(?:\.\d+)?)px$/.exec(v.trim());
      return m ? parseFloat(m[1]) : 0;
    };
    const onMove = (ev: PointerEvent) => {
      const s = moveStart.current;
      if (!s) return;
      const nextTop = `${Math.round(parse(typeof s.top === 'string' ? s.top : undefined) + (ev.clientY - s.y))}px`;
      const nextLeft = `${Math.round(parse(typeof s.left === 'string' ? s.left : undefined) + (ev.clientX - s.x))}px`;
      dispatch({
        type: 'UPDATE_NODE',
        id: node.id,
        updater: (n) => ({ ...n, styles: { ...n.styles, [breakpoint]: { ...n.styles[breakpoint], top: nextTop, left: nextLeft } } }),
      });
    };
    const onUp = () => {
      moveStart.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
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
      className={`wd-node${selected ? ' selected' : ''}${containerLike ? ' is-container' : ''}${dropTarget === node.id ? ' drop-target' : ''}`}
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dispatch({ type: 'SELECT', id: node.id });
        }
      }}
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
      title={`${node.name} (${node.type}) — click to select, double-click text to edit`}
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
          <span className="node-tag">{node.name}</span>
          <span className="node-btns">
            <button title="Move up" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'up' })}>↑</button>
            <button title="Move down" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'down' })}>↓</button>
            <button title="Indent / nest" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'right' })}>→</button>
            <button title="Outdent" onClick={() => dispatch({ type: 'MOVE', id: node.id, direction: 'left' })}>←</button>
            <button title="Duplicate (Ctrl+D)" onClick={() => dispatch({ type: 'DUPLICATE', id: node.id })}>⧉</button>
            <button title="Delete (Del)" onClick={() => dispatch({ type: 'DELETE', id: node.id })}>✕</button>
            <button title="Drag to move (absolute only)" className="move-handle" onPointerDown={beginMove}>✥</button>
          </span>
          <span className="resize-handle" title="Drag to resize" onPointerDown={beginResize}>◢</span>
        </div>
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
      return <span className="spacer-line">↕ {node.styles.desktop?.height || '32px'}</span>;
    case 'icon':
      return <span>{node.content || '★'}</span>;
    default:
      return <span>{node.content}</span>;
  }
}

import { useState } from 'react';
import { useDesigner } from '../store/DesignerContext';
import { ELEMENT_LIBRARY, SECTION_PRESETS } from '../elements/definitions';
import type { ElementType } from '../types';
import { TEMPLATES } from '../templates';

export default function ElementLibrary() {
  const { dispatch } = useDesigner();
  const [tab, setTab] = useState<'elements' | 'sections' | 'templates'>('elements');

  const onDragStart = (e: React.DragEvent, payload: string) => {
    e.dataTransfer.setData('application/x-webdesigner', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const addBasic = (type: ElementType) => {
    dispatch({ type: 'ADD', elementType: type, parentId: null });
  };

  return (
    <div className="panel library">
      <div className="tabs">
        <button className={tab === 'elements' ? 'active' : ''} onClick={() => setTab('elements')}>Elements</button>
        <button className={tab === 'sections' ? 'active' : ''} onClick={() => setTab('sections')}>Sections</button>
        <button className={tab === 'templates' ? 'active' : ''} onClick={() => setTab('templates')}>Templates</button>
      </div>

      {tab === 'elements' && (
        <>
          <div className="lib-group-label">Basic</div>
          <div className="lib-grid">
            {ELEMENT_LIBRARY.filter((i) => i.kind === 'basic').map((item) => (
              <button
                key={item.type}
                className="lib-item"
                draggable
                onDragStart={(e) => onDragStart(e, JSON.stringify({ kind: 'element', elementType: item.type }))}
                onClick={() => addBasic(item.type)}
                title={`${item.label} — ${item.hint}`}
              >
                <span className="lib-icon">{iconFor(item.type)}</span>
                <span className="lib-label">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="lib-group-label">Layout</div>
          <div className="lib-grid">
            {ELEMENT_LIBRARY.filter((i) => i.kind === 'layout').map((item) => (
              <button
                key={item.type}
                className="lib-item"
                draggable
                onDragStart={(e) => onDragStart(e, JSON.stringify({ kind: 'element', elementType: item.type }))}
                onClick={() => addBasic(item.type)}
                title={`${item.label} — ${item.hint}`}
              >
                <span className="lib-icon">{iconFor(item.type)}</span>
                <span className="lib-label">{item.label}</span>
              </button>
            ))}
          </div>
          <p className="hint">Tip: drag onto the canvas, or click to append. Select a Section/Container/Grid first to nest inside it.</p>
        </>
      )}

      {tab === 'sections' && (
        <div className="preset-list">
          {SECTION_PRESETS.map((p) => (
            <button
              key={p.key}
              className="preset-item"
              draggable
              onDragStart={(e) => onDragStart(e, JSON.stringify({ kind: 'preset', presetKey: p.key }))}
              onClick={() => {
                const found = SECTION_PRESETS.find((x) => x.key === p.key);
                if (found) dispatch({ type: 'ADD_PRESET_NODES', nodes: found.build() });
              }}
            >
              <strong>{p.label}</strong>
              <span>{p.description}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'templates' && (
        <div className="preset-list">
          {TEMPLATES.map((t) => (
            <button key={t.key} className="preset-item" onClick={() => dispatch({ type: 'APPLY_TEMPLATE', templateKey: t.key })}>
              <strong>{t.label}</strong>
              <span>{t.description}</span>
            </button>
          ))}
          <p className="hint">Applying a template replaces the current page content (undoable).</p>
        </div>
      )}
    </div>
  );
}

function iconFor(type: ElementType): string {
  switch (type) {
    case 'heading': return 'H';
    case 'text': return '¶';
    case 'button': return '▢';
    case 'image': return '🖼';
    case 'link': return '🔗';
    case 'divider': return '―';
    case 'spacer': return '↕';
    case 'icon': return '★';
    case 'section': return '▤';
    case 'container': return '▦';
    case 'grid': return '⊞';
    default: return '•';
  }
}

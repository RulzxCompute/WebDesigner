import { useState } from 'react';
import { useDesigner } from '../store/DesignerContext';
import type { ElementNode } from '../types';

export default function LayersPanel() {
  const { project, currentPageId, selectedId, dispatch } = useDesigner();
  const page = project.pages.find((p) => p.id === currentPageId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!page) return null;

  const startRename = (n: ElementNode) => {
    setEditingId(n.id);
    setEditName(n.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) dispatch({ type: 'RENAME', id: editingId, name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="panel layers">
      <div className="panel-title">Layers</div>
      <div className="tree">
        <div className="tree-page">📄 {page.name}</div>
        {page.root.map((n) => (
          <TreeRow key={n.id} node={n} depth={0} selectedId={selectedId} editingId={editingId} editName={editName} setEditName={setEditName} onSelect={(id) => dispatch({ type: 'SELECT', id })} onStartRename={startRename} onCommit={commitRename} />
        ))}
        {page.root.length === 0 && <div className="hint">No elements yet — add from the left panel.</div>}
      </div>
    </div>
  );
}

function TreeRow(props: {
  node: ElementNode;
  depth: number;
  selectedId: string | null;
  editingId: string | null;
  editName: string;
  setEditName: (v: string) => void;
  onSelect: (id: string) => void;
  onStartRename: (n: ElementNode) => void;
  onCommit: () => void;
}) {
  const { node, depth, selectedId, editingId, editName, setEditName, onSelect, onStartRename, onCommit } = props;
  const { dispatch } = useDesigner();
  return (
    <div>
      <div
        className={`tree-row${selectedId === node.id ? ' selected' : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onSelect(node.id)}
        onDoubleClick={() => onStartRename(node)}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/x-webdesigner', JSON.stringify({ kind: 'move', elementId: node.id }));
          e.stopPropagation();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            const data = JSON.parse(e.dataTransfer.getData('application/x-webdesigner') || '{}');
            if (data.kind === 'move' && data.elementId && data.elementId !== node.id) {
              // drop onto a container nests inside it; otherwise move after this node
              if (node.type === 'section' || node.type === 'container' || node.type === 'grid') {
                dispatch({ type: 'MOVE_TO', id: data.elementId, parentId: node.id });
              }
            }
          } catch { /* ignore invalid drops */ }
        }}
      >
        <span className="tree-type">{node.type}</span>
        {editingId === node.id ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={onCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommit();
              if (e.key === 'Escape') onCommit();
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="tree-name">{node.name}</span>
        )}
        <span className="tree-actions">
          <button title="Move up" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MOVE', id: node.id, direction: 'up' }); }}>↑</button>
          <button title="Move down" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MOVE', id: node.id, direction: 'down' }); }}>↓</button>
        </span>
      </div>
      {node.children.map((c) => (
        <TreeRow key={c.id} node={c} depth={depth + 1} selectedId={selectedId} editingId={editingId} editName={editName} setEditName={setEditName} onSelect={onSelect} onStartRename={onStartRename} onCommit={onCommit} />
      ))}
    </div>
  );
}

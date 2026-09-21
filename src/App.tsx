import { useEffect, useState } from 'react';
import { DesignerProvider, useDesigner } from './store/DesignerContext';
import Toolbar from './components/Toolbar';
import ElementLibrary from './components/ElementLibrary';
import LayersPanel from './components/LayersPanel';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import PreviewModal from './components/PreviewModal';
import { countNodes } from './elements/definitions';

const selectedMirror: { current: string | null } = { current: null };

function Shell() {
  const [preview, setPreview] = useState(false);
  const { dispatch, project, currentPageId, selectedId } = useDesigner();
  const page = project.pages.find((p) => p.id === currentPageId);
  const total = page ? countNodes(page.root) : 0;

  useEffect(() => {
    selectedMirror.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement | null;
      const typing = Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable));
      if (e.key === 'Escape') {
        setPreview(false);
        if (!typing) dispatch({ type: 'SELECT', id: null });
        return;
      }
      if (typing) return;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        dispatch({ type: 'MARK_SAVED' });
      } else if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedMirror.current) dispatch({ type: 'DUPLICATE', id: selectedMirror.current });
      } else if (mod && e.key.toLowerCase() === 'c') {
        dispatch({ type: 'COPY' });
      } else if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        dispatch({ type: 'PASTE' });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedMirror.current) {
          e.preventDefault();
          dispatch({ type: 'DELETE', id: selectedMirror.current });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  return (
    <div className="app">
      <Toolbar onPreview={() => setPreview(true)} />
      <div className="workspace">
        <aside className="left">
          <ElementLibrary />
          <LayersPanel />
        </aside>
        <main className="center">
          <Canvas />
        </main>
        <aside className="right">
          <PropertiesPanel />
        </aside>
      </div>
      <footer className="statusbar">
        <span>{total} elements</span>
        <span className="muted">Ctrl+S save · Ctrl+Z undo · Ctrl+Shift+Z redo · Del delete · Ctrl+D duplicate · double-click text to edit</span>
        <span className="muted">{page?.name} · {project.pages.length} page(s)</span>
      </footer>
      {preview && <PreviewModal onClose={() => setPreview(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <DesignerProvider>
      <Shell />
    </DesignerProvider>
  );
}

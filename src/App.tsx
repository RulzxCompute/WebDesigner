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
const transientMirror: { current: boolean } = { current: false };

function Shell() {
  const [preview, setPreview] = useState(false);
  const { dispatch, project, currentPageId, selectedId, transientBase } = useDesigner();
  const page = project.pages.find((p) => p.id === currentPageId);
  const total = page ? countNodes(page.root) : 0;

  useEffect(() => {
    selectedMirror.current = selectedId;
    transientMirror.current = transientBase !== null;
  }, [selectedId, transientBase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement | null;
      const typing = Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable));
      if (e.key === 'Escape') {
        if (transientMirror.current) {
          // Cancel an in-progress drag/nudge gesture, keep the selection.
          dispatch({ type: 'CANCEL_TRANSIENT' });
          return;
        }
        setPreview(false);
        if (!typing) dispatch({ type: 'SELECT', id: null });
        return;
      }
      if (typing) return;
      // Don't clobber an in-progress drag gesture (undo/redo safely commit it).
      if (transientMirror.current) return;
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
        <span className="muted">Drag handles to move / resize · Arrows nudge · Ctrl+Z undo · Del delete · Ctrl+D duplicate</span>
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

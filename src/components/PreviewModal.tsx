import { useDesigner } from '../store/DesignerContext';
import { RenderStaticNode } from './RenderNode';
import { UiIcon } from './icons';

export default function PreviewModal({ onClose }: { onClose: () => void }) {
  const { project, currentPageId, breakpoint, dispatch } = useDesigner();
  const page = project.pages.find((p) => p.id === currentPageId);
  if (!page) return null;
  const width = breakpoint === 'desktop' ? '100%' : breakpoint === 'tablet' ? '768px' : '375px';

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-bar" onClick={(e) => e.stopPropagation()}>
        <strong>Preview — {page.title || page.name}</strong>
        <div className="bp-switch">
          {(['desktop', 'tablet', 'mobile'] as const).map((bp) => (
            <button key={bp} className={breakpoint === bp ? 'active' : ''} onClick={() => dispatch({ type: 'SET_BREAKPOINT', bp })}>{bp}</button>
          ))}
        </div>
        <button onClick={onClose}><UiIcon name="x" size={14} /> Close (Esc)</button>
      </div>
      <div className="preview-frame" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        {page.root.map((n) => (
          <RenderStaticNode key={n.id} node={n} breakpoint={breakpoint} />
        ))}
      </div>
    </div>
  );
}

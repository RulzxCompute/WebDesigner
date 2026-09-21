import { useState } from 'react';
import { useDesigner } from '../store/DesignerContext';
import { exportProjectFiles } from '../exporter/generate';
import { blankProject, serializeProject, parseProjectFile } from '../storage/projectStorage';
import { downloadTextFile } from '../utils';
import { UiIcon } from './icons';

const BP_ICON = { desktop: 'monitor', tablet: 'tablet', mobile: 'smartphone' } as const;

export default function Toolbar({ onPreview }: { onPreview: () => void }) {
  const { project, dispatch, canUndo, canRedo, lastSavedAt, saveError, breakpoint } = useDesigner();
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2600);
  };

  const doExportZip = async () => {
    setExporting(true);
    try {
      const files = exportProjectFiles(project);
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      for (const f of files) zip.file(f.path, f.content);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-website.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
      flash(`Exported ${files.length} files — ready to host anywhere.`);
    } catch (e) {
      // fallback: single-file download
      try {
        const files = exportProjectFiles(project);
        const html = files.find((f) => f.path === 'index.html');
        if (html) downloadTextFile('index.html', html.content, 'text/html');
        flash('ZIP failed — downloaded index.html instead.');
      } catch {
        flash(e instanceof Error ? `Export failed: ${e.message}` : 'Export failed.');
      }
    } finally {
      setExporting(false);
    }
  };

  const doExportProject = () => {
    downloadTextFile(`${project.name.toLowerCase().replace(/\s+/g, '-')}.webdesigner`, serializeProject(project), 'application/json');
    flash('Project file (.webdesigner) downloaded.');
  };

  const doImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.webdesigner,.json,application/json';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        const parsed = parseProjectFile(String(r.result || ''));
        if (!parsed.ok || !parsed.project) {
          flash(parsed.error || 'Invalid project file.');
          return;
        }
        dispatch({ type: 'LOAD_PROJECT', project: parsed.project });
        flash(`Loaded “${parsed.project.name}”.`);
      };
      r.onerror = () => flash('Could not read that file.');
      r.readAsText(f);
    };
    input.click();
  };

  return (
    <header className="toolbar">
      <div className="brand">
        <span className="logo"><UiIcon name="logo" size={16} /></span>
        <strong>WebDesigner</strong>
        <span className="project-name" title="Project name">{project.name}</span>
        <span className="save-state" title={saveError || undefined}>
          {saveError ? (
            <><UiIcon name="alert" size={13} /> {saveError}</>
          ) : lastSavedAt ? (
            <><span className="save-dot" aria-hidden="true" /> autosaved {new Date(lastSavedAt).toLocaleTimeString()}</>
          ) : (
            <span className="save-dot" aria-hidden="true" />
          )}
        </span>
      </div>
      <div className="toolbar-actions">
        <button title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={() => dispatch({ type: 'UNDO' })} aria-label="Undo"><UiIcon name="undo" size={15} /></button>
        <button title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={() => dispatch({ type: 'REDO' })} aria-label="Redo"><UiIcon name="redo" size={15} /></button>
        <span className="sep" />
        <div className="bp-switch" role="tablist" aria-label="Responsive preview">
          {(['desktop', 'tablet', 'mobile'] as const).map((bp) => (
            <button key={bp} className={breakpoint === bp ? 'active' : ''} title={`${bp} preview`} onClick={() => dispatch({ type: 'SET_BREAKPOINT', bp })}>
              <UiIcon name={BP_ICON[bp]} size={14} /> {bp}
            </button>
          ))}
        </div>
        <span className="sep" />
        <button onClick={() => dispatch({ type: 'NEW_PROJECT', project: blankProject() })} title="New blank project">New</button>
        <button onClick={doImportProject} title="Open .webdesigner file">Open</button>
        <button onClick={doExportProject} title="Save project as .webdesigner file">Save file</button>
        <button className="primary-ghost" onClick={onPreview} title="Preview final website"><UiIcon name="eye" size={14} /> Preview</button>
        <button className="primary" disabled={exporting} onClick={doExportZip} title="Export clean static website (zip)">
          {exporting ? 'Exporting…' : 'Export Website'}
        </button>
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}
    </header>
  );
}

import { useDesigner } from '../store/DesignerContext';
import type { AnimationType, Breakpoint } from '../types';
import { ELEMENT_ICONS } from '../elements/iconSet';
import { ElementIcon } from './icons';

const FONTS = [
  'Inter, system-ui, sans-serif',
  'Roboto, system-ui, sans-serif',
  'Open Sans, system-ui, sans-serif',
  'Poppins, system-ui, sans-serif',
  'Montserrat, system-ui, sans-serif',
  'Lato, system-ui, sans-serif',
  'Playfair Display, Georgia, serif',
  'Georgia, serif',
  'Arial, Helvetica, sans-serif',
  'system-ui, -apple-system, sans-serif',
];

const ANIMATIONS: AnimationType[] = ['none', 'fadeIn', 'fadeUp', 'fadeDown', 'slideLeft', 'slideRight', 'zoomIn', 'hoverLift', 'hoverGlow'];

export default function PropertiesPanel() {
  const { selectedNode, breakpoint, dispatch } = useDesigner();

  if (!selectedNode) {
    return (
      <div className="panel props">
        <div className="panel-title">Properties</div>
        <p className="hint">Select an element on the canvas or in Layers to edit its content, layout, style, and animation.</p>
        <SiteSettings />
      </div>
    );
  }

  const n = selectedNode;
  const bp = breakpoint;
  const st = (key: string) => (n.styles[bp]?.[key as keyof typeof n.styles.desktop] as string | undefined) ?? (n.styles.desktop?.[key as keyof typeof n.styles.desktop] as string | undefined) ?? '';

  const setStyle = (key: string, value: string) => {
    dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, styles: { ...el.styles, [bp]: { ...el.styles[bp], [key]: value } } }) });
  };
  const clearOverride = () => {
    dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, styles: { ...el.styles, [bp]: {} } }) });
  };

  const setContent = (value: string) => {
    dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, content: value }) });
  };
  const setProp = (key: 'href' | 'src' | 'alt' | 'level' | 'icon' | 'openInNewTab', value: string | number | boolean) => {
    dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, props: { ...el.props, [key]: value } }) });
  };

  const isText = ['heading', 'text', 'paragraph', 'button', 'link'].includes(n.type);

  return (
    <div className="panel props">
      <div className="panel-title">Properties — {n.name} <span className="muted">({n.type})</span></div>
      <BreakpointNote bp={bp} onReset={bp !== 'desktop' ? clearOverride : undefined} />

      <Section title="Content">
        {isText && (
          <label>Text<textarea value={n.content ?? ''} rows={3} onChange={(e) => setContent(e.target.value)} /></label>
        )}
        {n.type === 'heading' && (
          <label>Level<select value={n.props.level ?? 2} onChange={(e) => setProp('level', Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>H{l}</option>)}
          </select></label>
        )}
        {(n.type === 'button' || n.type === 'link') && (
          <>
            <label>Link URL<input value={n.props.href ?? ''} onChange={(e) => setProp('href', e.target.value)} placeholder="https://… or #section" /></label>
            <label className="row"><input type="checkbox" checked={!!n.props.openInNewTab} onChange={(e) => setProp('openInNewTab', e.target.checked)} /> Open in new tab</label>
          </>
        )}
        {n.type === 'icon' && (
          <>
            <label>Icon
              <span className="hint">Pick an SVG icon — no emoji needed. Size and color are below.</span>
              <span className="icon-picker" role="listbox" aria-label="Choose icon">
                {ELEMENT_ICONS.map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    role="option"
                    aria-selected={(n.props.icon ?? 'star') === ic.id}
                    aria-label={ic.label}
                    title={ic.label}
                    className={(n.props.icon ?? 'star') === ic.id ? 'active' : ''}
                    onClick={() => setProp('icon', ic.id)}
                  >
                    <ElementIcon id={ic.id} size={20} />
                  </button>
                ))}
              </span>
            </label>
            <div className="grid2">
              <label>Size<input value={st('fontSize')} onChange={(e) => setStyle('fontSize', e.target.value)} placeholder="28px" /></label>
              <label>Color<input type="color" value={toColor(st('color') || '#111827')} onChange={(e) => setStyle('color', e.target.value)} /></label>
            </div>
          </>
        )}
        {n.type === 'image' && (
          <>
            <label>Image URL<input value={n.props.src ?? ''} onChange={(e) => setProp('src', e.target.value)} placeholder="https://…" /></label>
            <label>Alt text<input value={n.props.alt ?? ''} onChange={(e) => setProp('alt', e.target.value)} placeholder="Describe the image" /></label>
            <label>Upload<input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 2_500_000) {
                alert('Image is larger than ~2.5MB. Large images are stored as data URLs and may slow the editor.');
              }
              const r = new FileReader();
              r.onload = () => {
                const url = String(r.result || '');
                dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, props: { ...el.props, src: url, alt: el.props.alt || f.name } }) });
              };
              r.readAsDataURL(f);
            }} /></label>
          </>
        )}
        <label>Name (layers)<input value={n.name} onChange={(e) => dispatch({ type: 'RENAME', id: n.id, name: e.target.value })} /></label>
      </Section>

      {(n.type === 'heading' || n.type === 'text' || n.type === 'paragraph' || n.type === 'button' || n.type === 'link') && (
        <Section title="Typography">
          <label>Font<select value={n.styles.desktop.fontFamily ?? FONTS[0]} onChange={(e) => setStyle('fontFamily', e.target.value)}>
            {FONTS.map((f) => <option key={f} value={f}>{f.split(',')[0]}</option>)}
          </select></label>
          <div className="grid2">
            <label>Size<input value={st('fontSize')} onChange={(e) => setStyle('fontSize', e.target.value)} placeholder="16px" /></label>
            <label>Weight<select value={st('fontWeight') || '400'} onChange={(e) => setStyle('fontWeight', e.target.value)}>
              {['400', '500', '600', '700', '800'].map((w) => <option key={w} value={w}>{w}</option>)}
            </select></label>
          </div>
          <div className="grid2">
            <label>Line height<input value={st('lineHeight')} onChange={(e) => setStyle('lineHeight', e.target.value)} placeholder="1.6" /></label>
            <label>Spacing<input value={st('letterSpacing')} onChange={(e) => setStyle('letterSpacing', e.target.value)} placeholder="0px" /></label>
          </div>
          <div className="grid2">
            <label>Align<select value={st('textAlign') || 'left'} onChange={(e) => setStyle('textAlign', e.target.value)}>
              {['left', 'center', 'right', 'justify'].map((a) => <option key={a} value={a}>{a}</option>)}
            </select></label>
            <label>Color<input type="color" value={toColor(st('color') || '#111827')} onChange={(e) => setStyle('color', e.target.value)} /></label>
          </div>
        </Section>
      )}

      <Section title="Layout">
        <div className="grid2">
          <label>Display<select value={st('display') || ''} onChange={(e) => setStyle('display', e.target.value)}>
            <option value="">auto</option>
            <option value="block">block</option>
            <option value="flex">flex</option>
            <option value="grid">grid</option>
            <option value="inline-block">inline-block</option>
          </select></label>
          <label>Direction<select value={st('flexDirection') || ''} onChange={(e) => setStyle('flexDirection', e.target.value)}>
            <option value="">auto</option>
            <option value="row">row</option>
            <option value="column">column</option>
          </select></label>
        </div>
        <div className="grid2">
          <label>Justify<select value={st('justifyContent') || ''} onChange={(e) => setStyle('justifyContent', e.target.value)}>
            <option value="">auto</option>
            <option value="flex-start">start</option>
            <option value="center">center</option>
            <option value="flex-end">end</option>
            <option value="space-between">between</option>
          </select></label>
          <label>Align<select value={st('alignItems') || ''} onChange={(e) => setStyle('alignItems', e.target.value)}>
            <option value="">auto</option>
            <option value="flex-start">start</option>
            <option value="center">center</option>
            <option value="flex-end">end</option>
            <option value="stretch">stretch</option>
          </select></label>
        </div>
        <div className="grid2">
          <label>Gap<input value={st('gap')} onChange={(e) => setStyle('gap', e.target.value)} placeholder="16px" /></label>
          <label>Columns<input value={st('gridColumns')} onChange={(e) => setStyle('gridColumns', e.target.value)} placeholder="repeat(3, 1fr)" /></label>
        </div>
        <div className="grid2">
          <label>Width<input value={st('width')} onChange={(e) => setStyle('width', e.target.value)} placeholder="100%" /></label>
          <label>Height<input value={st('height')} onChange={(e) => setStyle('height', e.target.value)} placeholder="auto" /></label>
        </div>
        <div className="grid2">
          <label>Max width<input value={st('maxWidth')} onChange={(e) => setStyle('maxWidth', e.target.value)} placeholder="1100px" /></label>
          <label>Position<select value={st('position') || ''} onChange={(e) => setStyle('position', e.target.value)}>
            <option value="">static</option>
            <option value="relative">relative</option>
            <option value="absolute">absolute</option>
          </select></label>
        </div>
        {(st('position') === 'absolute' || n.styles.desktop.position === 'absolute') && (
          <div className="grid2">
            <label>Top<input value={st('top')} onChange={(e) => setStyle('top', e.target.value)} placeholder="0px" /></label>
            <label>Left<input value={st('left')} onChange={(e) => setStyle('left', e.target.value)} placeholder="0px" /></label>
          </div>
        )}
      </Section>

      <Section title="Style">
        <div className="grid2">
          <label>Background<input type="color" value={toColor(st('background') || '#ffffff')} onChange={(e) => setStyle('background', e.target.value)} /></label>
          <label>BG (text)<input value={st('background')} onChange={(e) => setStyle('background', e.target.value)} placeholder="#fff or gradient" /></label>
        </div>
        <div className="grid2">
          <label>Padding<input value={st('padding')} onChange={(e) => setStyle('padding', e.target.value)} placeholder="16px" /></label>
          <label>Margin<input value={st('margin')} onChange={(e) => setStyle('margin', e.target.value)} placeholder="0 auto" /></label>
        </div>
        <div className="grid2">
          <label>Border<input value={st('border')} onChange={(e) => setStyle('border', e.target.value)} placeholder="1px solid #eee" /></label>
          <label>Radius<input value={st('borderRadius')} onChange={(e) => setStyle('borderRadius', e.target.value)} placeholder="12px" /></label>
        </div>
        <div className="grid2">
          <label>Opacity<input value={st('opacity')} onChange={(e) => setStyle('opacity', e.target.value)} placeholder="1" /></label>
          <label>Z-index<input value={st('zIndex')} onChange={(e) => setStyle('zIndex', e.target.value)} placeholder="1" /></label>
        </div>
        {n.type === 'image' && (
          <label>Object fit<select value={st('objectFit') || 'cover'} onChange={(e) => setStyle('objectFit', e.target.value)}>
            {['cover', 'contain', 'fill', 'none'].map((o) => <option key={o} value={o}>{o}</option>)}
          </select></label>
        )}
      </Section>

      <Section title="Animation">
        <label>Preset<select value={n.animation?.type ?? 'none'} onChange={(e) => dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, animation: { type: e.target.value as AnimationType, duration: el.animation?.duration || '0.6s', delay: el.animation?.delay || '0s', easing: el.animation?.easing || 'ease' } }) })}>
          {ANIMATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select></label>
        <div className="grid2">
          <label>Duration<input value={n.animation?.duration ?? '0.6s'} onChange={(e) => dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, animation: { type: el.animation?.type || 'fadeUp', duration: e.target.value, delay: el.animation?.delay || '0s', easing: el.animation?.easing || 'ease' } }) })} /></label>
          <label>Delay<input value={n.animation?.delay ?? '0s'} onChange={(e) => dispatch({ type: 'UPDATE_NODE', id: n.id, updater: (el) => ({ ...el, animation: { type: el.animation?.type || 'fadeUp', duration: el.animation?.duration || '0.6s', delay: e.target.value, easing: el.animation?.easing || 'ease' } }) })} /></label>
        </div>
      </Section>

      <div className="danger-zone">
        <button onClick={() => dispatch({ type: 'DUPLICATE', id: n.id })}>Duplicate</button>
        <button className="danger" onClick={() => dispatch({ type: 'DELETE', id: n.id })}>Delete</button>
      </div>
      <SiteSettings />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="prop-section" open>
      <summary>{title}</summary>
      <div className="prop-body">{children}</div>
    </details>
  );
}

function BreakpointNote({ bp, onReset }: { bp: Breakpoint; onReset?: () => void }) {
  if (bp === 'desktop') return <div className="bp-note">Editing <b>Desktop</b> (base styles).</div>;
  return (
    <div className="bp-note warn">
      Editing <b>{bp}</b> override. <button onClick={onReset}>Reset {bp} styles</button>
    </div>
  );
}

function SiteSettings() {
  const { project, currentPageId, dispatch } = useDesigner();
  const page = project.pages.find((p) => p.id === currentPageId);
  return (
    <details className="prop-section">
      <summary>Page / Site</summary>
      <div className="prop-body">
        <label>Project name<input value={project.name} onChange={(e) => dispatch({ type: 'UPDATE_PROJECT_META', name: e.target.value })} /></label>
        <label>Page title<input value={page?.title ?? ''} onChange={(e) => dispatch({ type: 'UPDATE_PAGE_META', title: e.target.value })} /></label>
        <label>Page description<textarea rows={2} value={page?.description ?? ''} onChange={(e) => dispatch({ type: 'UPDATE_PAGE_META', description: e.target.value })} /></label>
        <label>Site title (fallback)<input value={project.settings.siteTitle} onChange={(e) => dispatch({ type: 'UPDATE_PROJECT_META', siteTitle: e.target.value })} /></label>
        <label>Site description (fallback)<textarea rows={2} value={project.settings.siteDescription} onChange={(e) => dispatch({ type: 'UPDATE_PROJECT_META', siteDescription: e.target.value })} /></label>
      </div>
    </details>
  );
}

function toColor(value: string): string {
  if (!value) return '#000000';
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [r, g, b] = [value[1], value[2], value[3]];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value);
  if (m) {
    const toH = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toH(Number(m[1]))}${toH(Number(m[2]))}${toH(Number(m[3]))}`;
  }
  if (value === 'transparent' || value === 'auto' || value === '') return '#ffffff';
  return '#000000';
}

import type { ElementNode, Page, WebDesignerProject } from '../types';
import { cssPropName, escapeHtml } from '../utils';
import { iconBody, resolveElementIconId } from '../elements/iconSet';

export function collectFonts(project: WebDesignerProject): string[] {
  const fonts = new Set<string>();
  const google = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat', 'Lato', 'Playfair'];
  const walk = (nodes: ElementNode[]) => {
    for (const n of nodes) {
      for (const bp of ['desktop', 'tablet', 'mobile'] as const) {
        const f = n.styles[bp]?.fontFamily;
        if (f) {
          const first = f.split(',')[0].trim().replace(/['"]/g, '');
          if (google.includes(first)) fonts.add(first);
        }
      }
      if (n.children.length) walk(n.children);
    }
  };
  for (const p of project.pages) walk(p.root);
  if (project.theme.fontFamily) {
    const first = project.theme.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    if (google.includes(first)) fonts.add(first);
  }
  return [...fonts];
}

function styleRecord(node: ElementNode, bp: 'desktop' | 'tablet' | 'mobile'): Record<string, string> {
  const raw = node.styles[bp] ?? {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v == null || v === '') continue;
    if (k === 'gridColumns' && node.type === 'grid') {
      out['gridTemplateColumns'] = v;
      continue;
    }
    if (k === 'gridRows') {
      out['gridTemplateRows'] = v;
      continue;
    }
    if (k === 'backgroundImage' && v) {
      out['backgroundImage'] = v.startsWith('url(') ? v : `url("${v}")`;
      continue;
    }
    out[k] = v;
  }
  return out;
}

function cssForNode(node: ElementNode): string {
  const lines: string[] = [];
  const cls = `.el-${node.id}`;
  const desktop = styleRecord(node, 'desktop');
  // sensible defaults per type for clean output
  const decls = Object.entries(desktop)
    .map(([k, v]) => `  ${cssPropName(k)}: ${v};`)
    .join('\n');
  lines.push(`${cls} {`);
  if (decls) lines.push(decls);
  if (node.animation && node.animation.type !== 'none' && node.animation.type.startsWith('hover')) {
    lines.push('  transition: transform .25s ease, box-shadow .25s ease;');
  }
  lines.push('}');
  const tablet = styleRecord(node, 'tablet');
  const tabletDecls = Object.entries(tablet)
    .map(([k, v]) => `    ${cssPropName(k)}: ${v};`)
    .join('\n');
  if (tabletDecls) {
    lines.push('@media (max-width: 1024px) {');
    lines.push(`  ${cls} {`);
    lines.push(tabletDecls);
    lines.push('  }');
    lines.push('}');
  }
  const mobile = styleRecord(node, 'mobile');
  const mobileDecls = Object.entries(mobile)
    .map(([k, v]) => `    ${cssPropName(k)}: ${v};`)
    .join('\n');
  if (mobileDecls) {
    lines.push('@media (max-width: 640px) {');
    lines.push(`  ${cls} {`);
    lines.push(mobileDecls);
    lines.push('  }');
    lines.push('}');
  }
  for (const child of node.children) {
    lines.push(cssForNode(child));
  }
  return lines.join('\n');
}

function animationAttr(node: ElementNode): string {
  const a = node.animation;
  if (!a || a.type === 'none') return '';
  const dur = a.duration || '0.6s';
  const delay = a.delay || '0s';
  const easing = a.easing || 'ease';
  return ` data-anim="${a.type}" style="--anim-dur:${dur};--anim-delay:${delay};--anim-ease:${easing};"`;
}

function renderNode(node: ElementNode): string {
  const cls = `el-${node.id}`;
  const anim = animationAttr(node);
  const children = node.children.map(renderNode).join('\n');
  const text = escapeHtml(node.content ?? '');
  switch (node.type) {
    case 'section':
      return `<section class="${cls}"${anim}>\n${children}\n</section>`;
    case 'container':
      return `<div class="${cls}"${anim}>\n${children}\n</div>`;
    case 'grid':
      return `<div class="${cls}"${anim}>\n${children}\n</div>`;
    case 'heading': {
      const level = Math.min(6, Math.max(1, node.props.level ?? 2));
      return `<h${level} class="${cls}"${anim}>${text}</h${level}>`;
    }
    case 'text':
      return `<div class="${cls}"${anim}>${text}</div>`;
    case 'paragraph':
      return `<p class="${cls}"${anim}>${text}</p>`;
    case 'button': {
      const href = escapeHtml(node.props.href || '#');
      const target = node.props.openInNewTab ? ' target="_blank" rel="noopener"' : '';
      return `<a class="${cls}" href="${href}"${target}${anim}>${text}</a>`;
    }
    case 'link': {
      const href = escapeHtml(node.props.href || '#');
      const target = node.props.openInNewTab ? ' target="_blank" rel="noopener"' : '';
      return `<a class="${cls}" href="${href}"${target}${anim}>${text}</a>`;
    }
    case 'image': {
      const src = escapeHtml(node.props.src || '');
      const alt = escapeHtml(node.props.alt || node.name || 'Image');
      return `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy"${anim} />`;
    }
    case 'divider':
      return `<hr class="${cls}"${anim} />`;
    case 'spacer':
      return `<div class="${cls}" aria-hidden="true"${anim}></div>`;
    case 'icon': {
      const iconId = resolveElementIconId(node.props.icon, node.content);
      const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconBody(iconId)}</svg>`;
      return `<span class="${cls} wd-icon" role="img" aria-label="${escapeHtml(node.name)}"${anim}>${svg}</span>`;
    }
    default:
      return `<div class="${cls}"${anim}>${text}${children}</div>`;
  }
}

function baseCss(): string {
  return `* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; color: #111827; background: #ffffff; line-height: 1.6; }
img { max-width: 100%; height: auto; }
a { text-decoration: none; }
.wd-page { min-height: 100vh; }
.wd-icon { display: inline-block; line-height: 1; vertical-align: middle; }
.wd-icon svg { width: 1em; height: 1em; display: block; }
/* animations */
[data-anim="fadeIn"] { opacity: 0; }
[data-anim="fadeUp"] { opacity: 0; transform: translateY(24px); }
[data-anim="fadeDown"] { opacity: 0; transform: translateY(-24px); }
[data-anim="slideLeft"] { opacity: 0; transform: translateX(32px); }
[data-anim="slideRight"] { opacity: 0; transform: translateX(-32px); }
[data-anim="zoomIn"] { opacity: 0; transform: scale(.94); }
[data-anim].wd-in { opacity: 1; transform: none; transition: opacity var(--anim-dur,.6s) var(--anim-ease,ease) var(--anim-delay,0s), transform var(--anim-dur,.6s) var(--anim-ease,ease) var(--anim-delay,0s); }
.el-hoverLift:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,.12); }
.el-hoverGlow:hover { box-shadow: 0 0 0 4px rgba(79,70,229,.25); }
@media (prefers-reduced-motion: reduce) { [data-anim] { opacity: 1 !important; transform: none !important; transition: none !important; } }`;
}

function hoverClass(node: ElementNode): string {
  if (!node.animation) return '';
  if (node.animation.type === 'hoverLift') return '\n.el-' + node.id + ':hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,.12); }';
  if (node.animation.type === 'hoverGlow') return '\n.el-' + node.id + ':hover { box-shadow: 0 0 0 4px rgba(79,70,229,.25); }';
  return '';
}

function collectHover(nodes: ElementNode[]): string {
  let out = '';
  for (const n of nodes) {
    out += hoverClass(n);
    if (n.children.length) out += collectHover(n.children);
  }
  return out;
}

function pageCss(page: Page): string {
  const parts = page.root.map((n) => cssForNode(n));
  return parts.join('\n') + collectHover(page.root);
}

function exportJs(): string {
  return `// WebDesigner static output — lightweight scroll animations
(function(){
  function init(){
    var els = document.querySelectorAll('[data-anim]');
    if(!('IntersectionObserver' in window) || !els.length){els.forEach(function(e){e.classList.add('wd-in')});return;}
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){en.target.classList.add('wd-in');io.unobserve(en.target);}
      });
    },{threshold:0.12});
    els.forEach(function(e){io.observe(e)});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}
})();`;
}

function googleFontsLink(fonts: string[]): string {
  if (!fonts.length) return '';
  const fam = fonts.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;600;700;800`).join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?${fam}&display=swap" rel="stylesheet">`;
}

export function exportPageHtml(project: WebDesignerProject, page: Page, opts: { inline?: boolean } = {}): string {
  const fonts = collectFonts(project);
  const body = page.root.map(renderNode).join('\n');
  const css = `${baseCss()}\n${pageCss(page)}`;
  const styleTag = opts.inline
    ? `<style>\n${css}\n  </style>`
    : `  <link rel="stylesheet" href="./styles.css">`;
  const scriptTag = opts.inline ? `<script>\n${exportJs()}\n  </script>` : `  <script src="./script.js" defer></script>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.title || project.settings.siteTitle || project.name)}</title>
  <meta name="description" content="${escapeHtml(page.description || project.settings.siteDescription || '')}" />
${fonts.length ? googleFontsLink(fonts) + '\n' : ''}${styleTag}
</head>
<body>
  <main class="wd-page">
${body}
  </main>
${scriptTag}
</body>
</html>
`;
}

export function exportProjectFiles(project: WebDesignerProject): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  // multi-page ready: first page -> index.html, others -> slug.html sharing styles.css
  const combinedCss = [baseCss()];
  for (const p of project.pages) combinedCss.push(`/* ${p.slug} */\n${pageCss(p)}`);
  files.push({ path: 'styles.css', content: combinedCss.join('\n') });
  files.push({ path: 'script.js', content: exportJs() });
  project.pages.forEach((page, idx) => {
    const filename = idx === 0 ? 'index.html' : `${page.slug || page.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    // standalone html referencing shared css/js
    const body = page.root.map(renderNode).join('\n');
    const fonts = collectFonts(project);
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.title || project.settings.siteTitle || project.name)}</title>
  <meta name="description" content="${escapeHtml(page.description || project.settings.siteDescription || '')}" />
${fonts.length ? googleFontsLink(fonts) + '\n' : ''}  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <main class="wd-page">
${body}
  </main>
  <script src="./script.js" defer></script>
</body>
</html>
`;
    files.push({ path: filename, content: html });
  });
  files.push({
    path: 'README.txt',
    content: `${project.name} — exported with WebDesigner\n\nHow to publish:\n1. Drag this folder to Netlify Drop, Cloudflare Pages, Vercel, or GitHub Pages.\n2. Done. No backend needed.\n`,
  });
  return files;
}

export function validateProject(data: unknown): { ok: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Project file is empty or invalid.' };
  const p = data as Partial<WebDesignerProject>;
  if (!Array.isArray(p.pages)) return { ok: false, error: 'Project is missing pages array.' };
  if (typeof p.name !== 'string') return { ok: false, error: 'Project is missing a name.' };
  return { ok: true };
}

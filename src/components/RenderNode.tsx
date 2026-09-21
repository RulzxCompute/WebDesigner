import type { CSSProperties } from 'react';
import type { Breakpoint, ElementNode, StyleProps } from '../types';
import { mergeStyles } from '../utils';

const FONT_FALLBACK = 'Inter, system-ui, sans-serif';

export function resolveStyle(node: ElementNode, bp: Breakpoint): CSSProperties {
  const base = node.styles.desktop ?? {};
  const over = bp === 'desktop' ? {} : (node.styles[bp] ?? {});
  const merged = mergeStyles(base as Record<string, string | undefined>, over as Record<string, string | undefined>) as StyleProps;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v == null || v === '') continue;
    if (k === 'gridColumns') {
      out['gridTemplateColumns'] = v;
      continue;
    }
    if (k === 'gridRows') {
      out['gridTemplateRows'] = v;
      continue;
    }
    out[k] = v;
  }
  if (!out.fontFamily && (node.type === 'heading' || node.type === 'text' || node.type === 'paragraph' || node.type === 'button' || node.type === 'link')) {
    out.fontFamily = FONT_FALLBACK;
  }
  return out as CSSProperties;
}

export function animClass(node: ElementNode): string {
  const t = node.animation?.type ?? 'none';
  if (t === 'none') return '';
  return ` wd-anim wd-${t}`;
}

export function RenderStaticNode({ node, breakpoint }: { node: ElementNode; breakpoint: Breakpoint }) {
  const style = resolveStyle(node, breakpoint);
  const cls = `wd-el${animClass(node)}`;
  const animStyle =
    node.animation && node.animation.type !== 'none'
      ? ({ '--anim-dur': node.animation.duration || '0.6s', '--anim-delay': node.animation.delay || '0s', '--anim-ease': node.animation.easing || 'ease' } as CSSProperties)
      : undefined;
  const mergedStyle = animStyle ? { ...style, ...animStyle } : style;
  const kids = node.children.map((c) => <RenderStaticNode key={c.id} node={c} breakpoint={breakpoint} />);
  switch (node.type) {
    case 'section':
      return <section className={cls} style={mergedStyle}>{kids}</section>;
    case 'container':
      return <div className={cls} style={mergedStyle}>{kids}</div>;
    case 'grid':
      return <div className={cls} style={mergedStyle}>{kids}</div>;
    case 'heading': {
      const L = Math.min(6, Math.max(1, node.props.level ?? 2));
      if (L === 1) return <h1 className={cls} style={mergedStyle}>{node.content}</h1>;
      if (L === 3) return <h3 className={cls} style={mergedStyle}>{node.content}</h3>;
      if (L === 4) return <h4 className={cls} style={mergedStyle}>{node.content}</h4>;
      if (L === 5) return <h5 className={cls} style={mergedStyle}>{node.content}</h5>;
      if (L === 6) return <h6 className={cls} style={mergedStyle}>{node.content}</h6>;
      return <h2 className={cls} style={mergedStyle}>{node.content}</h2>;
    }
    case 'text':
      return <div className={cls} style={mergedStyle}>{node.content}</div>;
    case 'paragraph':
      return <p className={cls} style={mergedStyle}>{node.content}</p>;
    case 'button':
      return <a className={cls} style={mergedStyle} href={node.props.href || '#'}>{node.content}</a>;
    case 'link':
      return <a className={cls} style={mergedStyle} href={node.props.href || '#'}>{node.content}</a>;
    case 'image':
      return <img className={cls} style={mergedStyle} src={node.props.src} alt={node.props.alt || node.name} loading="lazy" />;
    case 'divider':
      return <hr className={cls} style={mergedStyle} />;
    case 'spacer':
      return <div className={cls} style={mergedStyle} aria-hidden="true" />;
    case 'icon':
      return <span className={cls} style={mergedStyle} role="img" aria-label={node.name}>{node.content}</span>;
    default:
      return <div className={cls} style={mergedStyle}>{kids}</div>;
  }
}

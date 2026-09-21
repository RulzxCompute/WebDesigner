import type { Breakpoint, ElementNode, ElementType, StyleProps } from '../types';
import { uid } from '../utils';

function baseStyles(type: ElementType): StyleProps {
  switch (type) {
    case 'section':
      return {
        width: '100%',
        paddingTop: '64px',
        paddingBottom: '64px',
        paddingLeft: '24px',
        paddingRight: '24px',
        display: 'block',
        background: 'transparent',
      };
    case 'container':
      return {
        maxWidth: '1100px',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'block',
        paddingLeft: '16px',
        paddingRight: '16px',
      };
    case 'grid':
      return {
        display: 'grid',
        gridColumns: 'repeat(3, 1fr)',
        gap: '24px',
        width: '100%',
      };
    case 'heading':
      return {
        fontSize: '40px',
        fontWeight: '700',
        lineHeight: '1.2',
        marginTop: '0px',
        marginBottom: '12px',
        color: '#111827',
        fontFamily: 'Inter, system-ui, sans-serif',
      };
    case 'text':
    case 'paragraph':
      return {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#4b5563',
        marginTop: '0px',
        marginBottom: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
      };
    case 'button':
      return {
        background: '#111827',
        color: '#ffffff',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '24px',
        paddingRight: '24px',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        display: 'inline-block',
        textAlign: 'center',
        border: '1px solid transparent',
        fontFamily: 'Inter, system-ui, sans-serif',
      };
    case 'link':
      return {
        color: '#2563eb',
        fontSize: '16px',
        display: 'inline-block',
        fontFamily: 'Inter, system-ui, sans-serif',
      };
    case 'image':
      return {
        width: '100%',
        maxWidth: '560px',
        borderRadius: '12px',
        display: 'block',
        objectFit: 'cover',
      };
    case 'divider':
      return {
        width: '100%',
        borderTop: '1px solid #e5e7eb',
        marginTop: '16px',
        marginBottom: '16px',
      };
    case 'spacer':
      return { width: '100%', height: '32px', display: 'block' };
    case 'icon':
      return { fontSize: '28px', display: 'inline-block', color: '#111827', textAlign: 'center' };
    default:
      return {};
  }
}

function defaultContent(type: ElementType): string | undefined {
  switch (type) {
    case 'heading':
      return 'Design without code';
    case 'text':
    case 'paragraph':
      return 'Drag, drop, and style your way to a beautiful static website. Everything you see here is editable — no code required.';
    case 'button':
      return 'Get started';
    case 'link':
      return 'Learn more →';
    case 'icon':
      return '★';
    default:
      return undefined;
  }
}

function defaultName(type: ElementType): string {
  const map: Record<ElementType, string> = {
    section: 'Section',
    container: 'Container',
    grid: 'Grid',
    heading: 'Heading',
    text: 'Text',
    paragraph: 'Paragraph',
    button: 'Button',
    image: 'Image',
    link: 'Link',
    divider: 'Divider',
    spacer: 'Spacer',
    icon: 'Icon',
  };
  return map[type];
}

export function createElement(type: ElementType, overrides: Partial<ElementNode> = {}): ElementNode {
  const base = baseStyles(type);
  const styles: Record<Breakpoint, StyleProps> = {
    desktop: { ...base, ...(overrides.styles?.desktop ?? {}) },
    tablet: { ...(overrides.styles?.tablet ?? {}) },
    mobile: { ...(overrides.styles?.mobile ?? {}) },
  };
  const id = overrides.id ?? uid(type.slice(0, 3));
  return {
    id,
    type,
    name: overrides.name ?? `${defaultName(type)}`,
    content: overrides.content ?? defaultContent(type),
    props: {
      href: type === 'button' || type === 'link' ? '#' : undefined,
      src:
        type === 'image'
          ? 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop'
          : undefined,
      alt: type === 'image' ? 'Sample image' : undefined,
      level: type === 'heading' ? 2 : undefined,
      ...(overrides.props ?? {}),
    },
    styles,
    animation: overrides.animation ?? { type: 'none', duration: '0.6s', delay: '0s', easing: 'ease' },
    children: overrides.children ?? [],
  };
}

export interface LibraryItem {
  type: ElementType;
  label: string;
  hint: string;
  kind: 'basic' | 'layout' | 'section';
}

export const ELEMENT_LIBRARY: LibraryItem[] = [
  { type: 'heading', label: 'Heading', hint: 'H1–H6 title', kind: 'basic' },
  { type: 'text', label: 'Text', hint: 'Paragraph text', kind: 'basic' },
  { type: 'button', label: 'Button', hint: 'Call to action', kind: 'basic' },
  { type: 'image', label: 'Image', hint: 'URL or upload', kind: 'basic' },
  { type: 'link', label: 'Link', hint: 'Hyperlink', kind: 'basic' },
  { type: 'divider', label: 'Divider', hint: 'Horizontal line', kind: 'basic' },
  { type: 'spacer', label: 'Spacer', hint: 'Vertical space', kind: 'basic' },
  { type: 'icon', label: 'Icon', hint: 'Emoji / symbol', kind: 'basic' },
  { type: 'section', label: 'Section', hint: 'Full-width band', kind: 'layout' },
  { type: 'container', label: 'Container', hint: 'Centered wrapper', kind: 'layout' },
  { type: 'grid', label: 'Grid', hint: 'Multi-column', kind: 'layout' },
];

export interface SectionPreset {
  key: string;
  label: string;
  description: string;
  build: () => ElementNode[];
}

function heroPreset(): ElementNode[] {
  const section = createElement('section', {
    name: 'Hero',
    styles: {
      desktop: {
        width: '100%',
        background: 'linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)',
        paddingTop: '80px',
        paddingBottom: '80px',
        paddingLeft: '24px',
        paddingRight: '24px',
        textAlign: 'center',
      },
      tablet: {},
      mobile: {},
    },
  });
  const box = createElement('container', { name: 'Hero Content' });
  const h = createElement('heading', {
    name: 'Hero Heading',
    content: 'Build a stunning website without code',
    props: { level: 1 },
    styles: {
      desktop: {
        fontSize: '52px',
        fontWeight: '800',
        lineHeight: '1.1',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: '16px',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      tablet: { fontSize: '40px' },
      mobile: { fontSize: '30px' },
    },
    animation: { type: 'fadeUp', duration: '0.7s', delay: '0s', easing: 'ease-out' },
  });
  const p = createElement('paragraph', {
    name: 'Hero Subtitle',
    content: 'WebDesigner helps you design, preview, and export fast static websites you can host anywhere for free.',
    styles: {
      desktop: { fontSize: '18px', color: '#475569', textAlign: 'center', marginBottom: '28px' },
      tablet: {},
      mobile: { fontSize: '16px' },
    },
    animation: { type: 'fadeUp', duration: '0.7s', delay: '0.1s', easing: 'ease-out' },
  });
  const btn = createElement('button', {
    name: 'Hero Button',
    content: 'Start building',
    props: { href: '#features' },
    styles: {
      desktop: {
        background: '#4f46e5',
        color: '#ffffff',
        borderRadius: '12px',
        paddingTop: '14px',
        paddingBottom: '14px',
        paddingLeft: '28px',
        paddingRight: '28px',
        fontSize: '17px',
        fontWeight: '700',
        display: 'inline-block',
      },
      tablet: {},
      mobile: {},
    },
    animation: { type: 'fadeUp', duration: '0.7s', delay: '0.2s', easing: 'ease-out' },
  });
  box.children = [h, p, btn];
  section.children = [box];
  return [section];
}

function featuresPreset(): ElementNode[] {
  const section = createElement('section', { name: 'Features' });
  const box = createElement('container', { name: 'Features Wrap' });
  const h = createElement('heading', { name: 'Features Title', content: 'Everything you need', props: { level: 2 } });
  const grid = createElement('grid', { name: 'Feature Grid' });
  const cards = ['Fast static export', 'Responsive by default', 'No backend needed'].map((t, i) =>
    createElement('container', {
      name: `Feature ${i + 1}`,
      styles: {
        desktop: {
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          paddingTop: '24px',
          paddingBottom: '24px',
          paddingLeft: '24px',
          paddingRight: '24px',
        },
        tablet: {},
        mobile: {},
      },
      children: [
        createElement('icon', { name: `Feature Icon ${i + 1}`, content: ['⚡', '📱', '🚀'][i] }),
        createElement('heading', {
          name: `Feature H ${i + 1}`,
          content: t,
          props: { level: 3 },
          styles: {
            desktop: { fontSize: '20px', fontWeight: '700', color: '#111827' },
            tablet: {},
            mobile: {},
          },
        }),
        createElement('paragraph', {
          name: `Feature P ${i + 1}`,
          content: 'Clean output, simple workflow, and full control over layout and style.',
        }),
      ],
    }),
  );
  grid.children = cards;
  box.children = [h, grid];
  section.children = [box];
  return [section];
}

function simpleSection(label: string, title: string, body: string): ElementNode[] {
  const section = createElement('section', { name: label });
  const box = createElement('container', { name: `${label} Wrap` });
  box.children = [
    createElement('heading', { name: `${label} Title`, content: title, props: { level: 2 } }),
    createElement('paragraph', { name: `${label} Text`, content: body }),
  ];
  section.children = [box];
  return [section];
}

function footerPreset(): ElementNode[] {
  const section = createElement('section', {
    name: 'Footer',
    styles: {
      desktop: { background: '#0f172a', paddingTop: '40px', paddingBottom: '40px', width: '100%' },
      tablet: {},
      mobile: {},
    },
  });
  const box = createElement('container', { name: 'Footer Wrap' });
  box.children = [
    createElement('text', {
      name: 'Footer Text',
      content: '© 2026 My Website — Built with WebDesigner',
      styles: { desktop: { color: '#cbd5e1', textAlign: 'center', fontSize: '14px' }, tablet: {}, mobile: {} },
    }),
  ];
  section.children = [box];
  return [section];
}

export const SECTION_PRESETS: SectionPreset[] = [
  { key: 'hero', label: 'Hero', description: 'Big title + CTA', build: heroPreset },
  { key: 'features', label: 'Features', description: '3-column grid', build: featuresPreset },
  { key: 'about', label: 'About', description: 'Title + text', build: () => simpleSection('About', 'About us', 'Tell your story in a few clear sentences. Who you are, what you do, and why it matters.') },
  { key: 'services', label: 'Services', description: 'Title + text', build: () => simpleSection('Services', 'What we offer', 'List your services with short, benefit-focused descriptions.') },
  { key: 'contact', label: 'Contact', description: 'CTA + button', build: () => simpleSection('Contact', 'Get in touch', 'Add your email or a call-to-action button so visitors can reach you.') },
  { key: 'footer', label: 'Footer', description: 'Dark footer bar', build: footerPreset },
];

export function findNode(nodes: ElementNode[], id: string): ElementNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const inChild = findNode(n.children, id);
    if (inChild) return inChild;
  }
  return null;
}

export function removeNode(nodes: ElementNode[], id: string): ElementNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeNode(n.children, id) }));
}

export function insertNode(nodes: ElementNode[], newNode: ElementNode, parentId: string | null, index?: number): ElementNode[] {
  if (parentId === null) {
    const next = [...nodes];
    const at = index == null ? next.length : Math.max(0, Math.min(index, next.length));
    next.splice(at, 0, newNode);
    return next;
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = [...n.children];
      const at = index == null ? children.length : Math.max(0, Math.min(index, children.length));
      children.splice(at, 0, newNode);
      return { ...n, children };
    }
    return { ...n, children: insertNode(n.children, newNode, parentId, index) };
  });
}

export function updateNode(nodes: ElementNode[], id: string, updater: (n: ElementNode) => ElementNode): ElementNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n);
    return { ...n, children: updateNode(n.children, id, updater) };
  });
}

export function countNodes(nodes: ElementNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
}

export function canHaveChildren(type: ElementType): boolean {
  return type === 'section' || type === 'container' || type === 'grid';
}

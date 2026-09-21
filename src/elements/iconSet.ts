// Curated SVG icon set for the Icon element.
// Stroke-based (24x24 grid, round caps) so icons inherit text color and scale
// with font-size. Bodies are trusted static markup shared by the editor,
// preview, and static exporter — no emoji, no external font needed.

export interface IconDef {
  id: string;
  label: string;
  /** Inner SVG markup (paths/shapes only, no <svg> wrapper). */
  body: string;
}

export const ELEMENT_ICONS: IconDef[] = [
  {
    id: 'star',
    label: 'Star',
    body: '<path d="M12 2.5l2.9 6.2 6.6 1-4.8 4.8 1.1 6.7L12 18l-5.8 3.2 1.1-6.7L2.5 9.7l6.6-1L12 2.5z"/>',
  },
  {
    id: 'heart',
    label: 'Heart',
    body: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  },
  {
    id: 'zap',
    label: 'Lightning',
    body: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  },
  {
    id: 'rocket',
    label: 'Rocket',
    body: '<path d="M12 2.5c2.8 1.8 4.8 5.4 4.8 9.3l2.7 2.7-3.8 1c-1 .9-2 1.8-3.7 2.7-1.7-.9-2.7-1.8-3.7-2.7l-3.8-1 2.7-2.7c0-3.9 2-7.5 4.8-9.3z"/><circle cx="12" cy="9" r="1.6"/><path d="M10.2 17.5c-.2 1.8.4 3.2 1.8 4.5 1.4-1.3 2-2.7 1.8-4.5"/>',
  },
  {
    id: 'palette',
    label: 'Palette',
    body: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10.5" r="1.1" fill="currentColor" stroke="none"/><path d="M12 21c-.9 0-1.6-.7-1.6-1.6 0-1.4 1.2-2.1 2.6-2.1h2.5a3.3 3.3 0 0 0 0-6.6h-1"/>',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    body: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><line x1="11" y1="18.5" x2="13" y2="18.5"/>',
  },
  {
    id: 'check',
    label: 'Check',
    body: '<polyline points="20 6 9 17 4 12"/>',
  },
  {
    id: 'plus',
    label: 'Plus',
    body: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  },
  {
    id: 'arrowRight',
    label: 'Arrow right',
    body: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  },
  {
    id: 'arrowUpRight',
    label: 'Arrow up right',
    body: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  },
  {
    id: 'play',
    label: 'Play',
    body: '<polygon points="6 3.5 20 12 6 20.5 6 3.5"/>',
  },
  {
    id: 'mail',
    label: 'Mail',
    body: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><polyline points="21.5 6.5 12 13 2.5 6.5"/>',
  },
  {
    id: 'phone',
    label: 'Phone',
    body: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  },
  {
    id: 'mapPin',
    label: 'Location pin',
    body: '<path d="M21 10c0 7-9 12.5-9 12.5S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  },
  {
    id: 'globe',
    label: 'Globe',
    body: '<circle cx="12" cy="12" r="9.5"/><line x1="2.5" y1="12" x2="21.5" y2="12"/><path d="M12 2.5a15 15 0 0 1 3.8 9.5 15 15 0 0 1-3.8 9.5 15 15 0 0 1-3.8-9.5A15 15 0 0 1 12 2.5z"/>',
  },
  {
    id: 'home',
    label: 'Home',
    body: '<path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    id: 'user',
    label: 'User',
    body: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    body: '<rect x="3" y="4.5" width="18" height="17" rx="2"/><line x1="16" y1="2.5" x2="16" y2="6.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="3" y1="10.5" x2="21" y2="10.5"/>',
  },
  {
    id: 'cart',
    label: 'Cart',
    body: '<circle cx="9" cy="20.5" r="1.3"/><circle cx="18.5" cy="20.5" r="1.3"/><path d="M1.5 2h3.5l2.6 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22.5 6H6"/>',
  },
  {
    id: 'search',
    label: 'Search',
    body: '<circle cx="11" cy="11" r="7.5"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>',
  },
  {
    id: 'menu',
    label: 'Menu',
    body: '<line x1="3.5" y1="6.5" x2="20.5" y2="6.5"/><line x1="3.5" y1="12" x2="20.5" y2="12"/><line x1="3.5" y1="17.5" x2="20.5" y2="17.5"/>',
  },
  {
    id: 'bell',
    label: 'Bell',
    body: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  },
  {
    id: 'download',
    label: 'Download',
    body: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  },
  {
    id: 'externalLink',
    label: 'External link',
    body: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  },
];

const byId = new Map(ELEMENT_ICONS.map((i) => [i.id, i]));

/** Inner SVG markup for an icon id, falling back to the star icon. */
export function iconBody(id: string | undefined): string {
  if (id && byId.has(id)) return (byId.get(id) as IconDef).body;
  return (byId.get('star') as IconDef).body;
}

export function isKnownIconId(id: string | undefined): boolean {
  return !!id && byId.has(id);
}

/**
 * Maps legacy emoji/symbol content (from projects created before the SVG
 * icon set) to an icon id. Returns null when there is nothing to migrate.
 */
export function legacyContentToIconId(content: string | undefined): string | null {
  if (!content) return null;
  const text = content.trim();
  // Note: cases use unicode escapes for legacy emoji content (pre-SVG projects).
  switch (text) {
    case '\u2605':
    case '*':
      return 'star';
    case '\u26A1':
      return 'zap';
    case '\u{1F680}':
      return 'rocket';
    case '\u{1F3A8}':
      return 'palette';
    case '\u{1F4F1}':
      return 'mobile';
    case '\u2764':
    case '\u2665':
      return 'heart';
    case '\u2713':
      return 'check';
    case '\u25B6':
      return 'play';
    default:
      return null;
  }
}

/** Resolves which icon id an Icon element should render. */
export function resolveElementIconId(propsIcon: string | undefined, content: string | undefined): string {
  if (isKnownIconId(propsIcon)) return propsIcon as string;
  return legacyContentToIconId(content) ?? 'star';
}

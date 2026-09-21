import type { ReactNode } from 'react';
import { iconBody } from '../elements/iconSet';

// ---------------------------------------------------------------------------
// Editor UI icons (toolbar, library, canvas overlay, layers, preview).
// Inline SVGs in currentColor — no emoji, no external assets.
// ---------------------------------------------------------------------------

export type UiIconName =
  | 'logo'
  | 'undo'
  | 'redo'
  | 'monitor'
  | 'tablet'
  | 'smartphone'
  | 'eye'
  | 'x'
  | 'plus'
  | 'copy'
  | 'trash'
  | 'move'
  | 'resize'
  | 'chevronUp'
  | 'chevronDown'
  | 'arrowUp'
  | 'arrowDown'
  | 'arrowLeft'
  | 'arrowRight'
  | 'alert'
  | 'fileText'
  | 'layers'
  | 'heading'
  | 'text'
  | 'buttonEl'
  | 'image'
  | 'link'
  | 'divider'
  | 'spacer'
  | 'starEl'
  | 'section'
  | 'container'
  | 'grid';

const PATHS: Record<UiIconName, ReactNode> = {
  logo: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 12h18M12 12v9" />
    </>
  ),
  undo: (
    <>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
    </>
  ),
  redo: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  tablet: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ),
  smartphone: (
    <>
      <rect x="6.5" y="2" width="11" height="20" rx="2.5" />
      <line x1="12" y1="18.5" x2="12.01" y2="18.5" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  move: (
    <>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </>
  ),
  resize: <path d="M20 4 4 20h16V4z" fill="currentColor" stroke="none" />,
  chevronUp: <polyline points="18 15 12 9 6 15" />,
  chevronDown: <polyline points="6 9 12 15 18 9" />,
  arrowUp: (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </>
  ),
  arrowDown: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </>
  ),
  arrowLeft: (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  heading: <path d="M5 5v14M12 5v14M5 12h7" />,
  text: <path d="M4 6h16M4 10.5h16M4 15h10M4 19.5h7" />,
  buttonEl: <rect x="3" y="7.5" width="18" height="9" rx="4.5" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4.5 18 10 12.5l2.8 2.8 3.2-3.2 4.5 4.4" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </>
  ),
  divider: (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  spacer: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <polyline points="9 6 12 3 15 6" />
      <polyline points="9 18 12 21 15 18" />
    </>
  ),
  starEl: <path d="M12 2.5l2.9 6.2 6.6 1-4.8 4.8 1.1 6.7L12 18l-5.8 3.2 1.1-6.7L2.5 9.7l6.6-1L12 2.5z" />,
  section: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <line x1="3" y1="9.3" x2="21" y2="9.3" />
      <line x1="3" y1="14.6" x2="21" y2="14.6" />
    </>
  ),
  container: (
    <>
      <rect x="7.5" y="4" width="9" height="16" rx="1" />
      <path d="M3 7V4.5A1.5 1.5 0 0 1 4.5 3H6M18 3h1.5A1.5 1.5 0 0 1 21 4.5V7M21 17v2.5a1.5 1.5 0 0 1-1.5 1.5H18M6 21H4.5A1.5 1.5 0 0 1 3 19.5V17" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <line x1="15" y1="4" x2="15" y2="20" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </>
  ),
};

export function UiIcon({
  name,
  size = 16,
  className,
}: {
  name: UiIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className ? `ui-icon ${className}` : 'ui-icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Icon-element glyph: renders an id from the curated set. Size defaults to
// 1em so editor font-size styles control it, matching exported output.
// ---------------------------------------------------------------------------

export function ElementIcon({
  id,
  size = '1em',
  className,
}: {
  id: string;
  size?: number | string;
  className?: string;
}) {
  const body = iconBody(id);
  const dim = typeof size === 'number' ? `${size}px` : size;
  return (
    <svg
      className={className ? `wd-glyph ${className}` : 'wd-glyph'}
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

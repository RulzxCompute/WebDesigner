let counter = 0;

export function uid(prefix = 'el'): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function isValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    const u = new URL(value, 'http://localhost');
    return Boolean(u);
  } catch {
    return false;
  }
}

export function sanitizeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
}

export function cssPropName(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export function styleObjectToCss(style: Record<string, string | undefined>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(style)) {
    if (v == null || v === '') continue;
    parts.push(`  ${cssPropName(k)}: ${v};`);
  }
  return parts.join('\n');
}

export function mergeStyles(
  base: Record<string, string | undefined>,
  override?: Record<string, string | undefined>,
): Record<string, string | undefined> {
  if (!override) return { ...base };
  const out: Record<string, string | undefined> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v != null && v !== '') out[k] = v;
  }
  return out;
}

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 500): T {
  let t: ReturnType<typeof setTimeout> | undefined;
  const wrapped = (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
  return wrapped as T;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

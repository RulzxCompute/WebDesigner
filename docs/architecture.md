# Architecture

## Stack

- Vite + React 19 + TypeScript (strict)
- No UI framework; hand-rolled CSS for speed
- `jszip` only for export ZIP; `vitest` for tests

## Data model

```json
{
  "version": 1,
  "name": "My Website",
  "pages": [{ "id": "...", "name": "Home", "slug": "index", "title": "...", "description": "...", "root": [] }],
  "theme": {},
  "assets": [],
  "settings": {}
}
```

- `ElementNode`: `{ id, type, name, content?, props, styles: { desktop, tablet, mobile }, animation?, children[] }`
- Pages are future-ready: exporter already emits `index.html` + `<slug>.html` sharing CSS/JS.

## Modules

- `elements/definitions.ts` — factory, library metadata, section presets, tree ops (`insert/remove/update`, `canHaveChildren`)
- `templates/` — 6 pages built from the same element factory
- `store/DesignerContext.tsx` — `useReducer` + history stacks (max 60). Every mutation snapshots `project` for undo/redo. Autosave via debounced `localStorage`.
- `components/RenderNode.tsx` — breakpoint-aware style resolver used by canvas + preview
- `components/Canvas.tsx` — selection, DnD from library, resize/move handles, inline text edit
- `components/PropertiesPanel.tsx` — per-breakpoint style editing
- `exporter/generate.ts` — walks the tree → semantic HTML + per-element CSS classes (`.el-<id>`) + media queries + tiny scroll-animation JS

## Style resolution

`desktop` is the base; `tablet`/`mobile` are sparse overrides merged at render and export time. Grid uses `gridColumns` → `grid-template-columns`.

## Future hooks

Themes/design tokens can live in `ProjectTheme`; custom CSS/JS, SEO, favicon, and multi-page UI slot into `ProjectSettings` + `Page` without breaking the `.webdesigner` JSON (bump `version`).

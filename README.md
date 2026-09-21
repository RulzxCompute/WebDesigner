# WebDesigner

Visual static website builder. Design portfolio, landing, business, event, bio, and showcase pages **without writing code**, then export a clean, portable static site.

## Features

- Visual canvas: add, select, move, resize, duplicate, delete, rename, reorder
- Elements: heading, text, button, image, link, divider, spacer, icon (24 curated SVG glyphs, no emoji) + section/container/grid
- Preset sections: hero, features, about, services, contact, footer
- 6 ready templates: personal portfolio, developer portfolio, product landing, business landing, event, bio/links
- Properties panel: typography, layout (flex/grid), spacing, colors, borders, position
- Responsive: desktop / tablet / mobile breakpoints + preview widths
- Animations: fade, slide, zoom, hover lift/glow with duration/delay/easing
- Layers tree with rename + reorder
- Autosave (localStorage), Save/Load `.webdesigner` project files
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z), copy/paste/duplicate, keyboard shortcuts
- Preview mode without editor UI
- Static export (`index.html`, `styles.css`, `script.js` as ZIP) — no backend needed

## Screenshots

> Placeholder — add screenshots here:
>
> - `docs/screenshots/editor.png`
> - `docs/screenshots/preview.png`
> - `docs/screenshots/export.png`

## Getting Started

```bash
git clone <your-repo-url>
cd WebDesigner
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview with `npm run preview`.

## Testing

```bash
npm test
npm run lint
npm run build
```

## Export Website

1. Click **Export Website** in the top bar.
2. A ZIP is downloaded (`<project>-website.zip`) containing:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.txt`
3. Unzip and open `index.html`, or upload the folder to any static host.

Multi-page ready: additional pages export as `<slug>.html` sharing the same CSS/JS.

## Deployment

Upload the exported folder to:

- **GitHub Pages**: repo Settings → Pages → Deploy from branch, push `index.html` to `main`.
- **Cloudflare Pages**: Dashboard → Pages → Upload assets (drag the folder).
- **Netlify**: Drop the folder on https://app.netlify.com/drop, or `netlify deploy`.
- **Vercel**: `vercel` in the export folder, or drag-and-drop in the dashboard.

See `docs/deployment.md` and `docs/exporting.md` for step-by-step guides.

## Project Structure

```text
src/
  App.tsx               # layout + shortcuts
  types.ts              # project/element types
  utils.ts              # ids, css helpers
  elements/definitions.ts  # element factory, library, presets, tree ops
  templates/            # 6 starter templates
  store/DesignerContext.tsx # state, history (undo/redo), autosave
  components/           # Toolbar, Library, Layers, Canvas, Props, Preview
  exporter/generate.ts  # static HTML/CSS/JS generator
  storage/projectStorage.ts # localStorage + .webdesigner files
docs/
  architecture.md development.md exporting.md deployment.md
```

## Development

- `npm run dev` — HMR editor
- `npm test` — vitest unit tests (element tree + exporter)
- `npm run lint` — oxlint
- Keep deps minimal; no UI framework beyond React.

## Roadmap

- Multi-page UI (add/rename/delete pages)
- Reusable components, themes/design tokens, custom CSS
- SEO editor, favicon, Open Graph
- Forms, CMS hooks, analytics snippets
- Cloud save, collaboration, plugin system
- Image optimization, asset manager

## Contributing

1. Fork, create a branch.
2. `npm install`, `npm run dev`.
3. Add/adjust tests for exporter or tree logic.
4. Ensure `npm test`, `npm run lint`, `npm run build` pass.
5. Open a PR describing behavior + verification.

## License

MIT — see [LICENSE](LICENSE).

# Exporting

## What you get

`Export Website` produces a ZIP:

```text
<project>-website.zip
  index.html
  styles.css
  script.js
  README.txt
```

With more pages: `about.html`, `projects.html`, etc., all sharing `styles.css`/`script.js`.

## Guarantees

- No dependency on WebDesigner at runtime.
- Semantic tags (`section`, `h1–h6`, `p`, `a`, `img` with `alt`, `hr`).
- Responsive via two media queries (`1024px`, `640px`).
- Animations are CSS + a ~20-line IntersectionObserver; `prefers-reduced-motion` disables them.
- Content is HTML-escaped; broken images get a graceful fallback in the editor (export keeps your URL).

## Verify locally

```bash
npm run build
# after exporting + unzipping to ./site:
npx serve site
```

Open the served URL, check: layout, tablet/mobile widths, no console errors, images/links, animations.

## Troubleshooting

- **ZIP fails**: the app falls back to downloading `index.html` (inline check your blocker).
- **Images missing**: external URLs need internet; uploaded images embed as data URLs (keep them under ~2.5MB).
- **Fonts**: Google Fonts used on canvas become `<link>` tags in export; system fonts need nothing.

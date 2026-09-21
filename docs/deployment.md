# Deployment

Export first (top bar → **Export Website**), unzip, then pick a host. No backend needed.

## GitHub Pages

1. Create a repo, push the exported files (`index.html` at root).
2. Repo → Settings → Pages → Deploy from branch → `main` / root.
3. Wait ~1 min, open `https://<user>.github.io/<repo>/`.

## Cloudflare Pages

1. Dashboard → Workers & Pages → Create → Pages → Upload assets.
2. Drag the export folder, name the project, Deploy.
3. You get `https://<project>.pages.dev`.

## Netlify

- Option A: drag the folder onto https://app.netlify.com/drop.
- Option B: `npm i -g netlify-cli && netlify deploy --dir=. --prod`.

## Vercel

- `npx vercel` inside the export folder, or dashboard → Add New → Project → upload.
- Framework preset: Other / static. No build command needed.

## Checklist

- [ ] `index.html` opens locally with no console errors
- [ ] Mobile width (375px) looks right
- [ ] Title + meta description set (Properties → Page/Site)
- [ ] Images have alt text
- [ ] Links point to real URLs, not `#`

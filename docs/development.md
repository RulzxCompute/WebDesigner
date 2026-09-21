# Development

## Prereqs

- Node 20+
- npm 10+

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest run
npm run lint     # oxlint
npm run build    # tsc -b && vite build
npm run preview  # serve dist/
```

## Workflow

1. Edit in `src/` — modules are split by concern (see README project structure).
2. Element changes go in `elements/definitions.ts` + `components/Canvas.tsx` + `exporter/generate.ts` together so editor and export stay in sync.
3. Keep `desktop` styles as the source of truth; add breakpoint overrides sparingly.
4. Run `npm test && npm run lint && npm run build` before committing.

## Conventions

- TypeScript strict (`noUnusedLocals`, `erasableSyntaxOnly` — use `type`, not `enum`).
- Minimal deps; justify any new dependency in the PR.
- Export must stay backend-free and valid when opened via `file://` or any static host.

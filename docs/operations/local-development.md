# Local development

**Purpose:** get the site running locally and know the everyday commands. The app is
in this checkout; these commands are the current contract, not a future scaffold.

Related: [deployment](deployment.md) · [environment variables](environment-variables.md)
· [quality and testing](../engineering/quality-and-testing.md)

## Prerequisites

- **Node.js 22 LTS** (pinned via `.nvmrc`; `nvm use`). pnpm 11.9 requires Node
  `>=22.13`.
- **pnpm** (`corepack enable` then `corepack prepare pnpm@latest --activate`, or install
  directly).
- Git.
- Optional: Docker (to run the production image locally, matching the server).

## First run

```bash
git clone git@github.com:spockey4711/Portfolio-public.git
cd Portfolio-public
nvm use                 # Node 22
pnpm install
cp .env.example .env.local   # fill in as needed (all optional for a basic run)
pnpm dev                # http://localhost:3000
```

The site must run with an empty `.env.local`: the mounted heatmap falls back to its
static caption (see [rendering and data](../architecture/rendering-and-data.md)), so no
secrets are needed for local UI work. Variable names are in
[environment variables](environment-variables.md).

## Everyday commands

```bash
pnpm dev          # dev server with HMR
pnpm build        # production build
pnpm start        # serve the production build locally
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # Playwright smoke tests
pnpm format       # Prettier write
```

## Run the production image locally (optional)

Matches what runs on the server, useful before a deploy:

```bash
docker build -t portfolio:local .
docker run --rm -p 3000:3000 --env-file .env.local portfolio:local
# http://localhost:3000
```

Or via compose:

```bash
docker compose up --build
```

## Working on animations

- Test with `prefers-reduced-motion` both off and on (OS setting, or emulate in
  DevTools → Rendering). Reduced motion must fully degrade per
  [accessibility](../design/accessibility.md).
- The nav percentage is the scroll UI that is mounted. It should not trigger React
  re-renders on scroll (the hook writes the DOM from a ref). A scroll-spine element is
  specified in [animation and motion](../design/animation-and-motion.md) and is not in
  the tree; do not debug a component that is not rendered.

## Troubleshooting

- **Port in use:** `pnpm dev -- -p 3001`.
- **Stale build:** remove `.next` and rebuild.
- **Wrong Node:** `nvm use`; mismatches cause obscure build errors.
- **Fonts flashing:** ensure fonts load via `next/font`, not a raw stylesheet link.

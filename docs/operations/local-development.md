# Local development

**Purpose:** get the site running locally and know the everyday commands. These become
valid in **P0** when the app is scaffolded; until then this is the target contract.

Related: [deployment](../../private-docs/docs/operations/deployment.md) · [environment variables](../../private-docs/docs/operations/environment-variables.md)
· [quality & testing](../engineering/quality-and-testing.md)

## Prerequisites

- **Node.js 22 LTS** (pinned via `.nvmrc`; `nvm use`). pnpm 11.9 requires Node
  `>=22.13`.
- **pnpm** (`corepack enable` then `corepack prepare pnpm@latest --activate`, or install
  directly).
- Git.
- Optional: Docker (to run the production image locally, matching the server).

## First run

```bash
git clone git@github.com:spockey4711/portfolio.git
cd portfolio
nvm use                 # Node 22
pnpm install
cp .env.example .env.local   # fill in as needed (all optional for a basic run)
pnpm dev                # http://localhost:3000
```

The site must run with an empty `.env.local`: live widgets fall back to their static
placeholder states (see [rendering & data](../architecture/rendering-and-data.md)), so no
secrets are needed for local UI work.

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
- Verify the scroll spine stays smooth - it should not trigger React re-renders on scroll
  (check the profiler).

## Troubleshooting

- **Port in use:** `pnpm dev -- -p 3001`.
- **Stale build:** remove `.next` and rebuild.
- **Wrong Node:** `nvm use`; mismatches cause obscure build errors.
- **Fonts flashing:** ensure fonts load via `next/font`, not a raw stylesheet link.

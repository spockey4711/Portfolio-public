# Environment variables

**Purpose:** the public catalog of env var **names** used by this app. Values are
not stored here. Copy `.env.example` to `.env.local` for local work. Every variable
is optional: `pnpm dev` and `pnpm build` must succeed with none of them set.

Related: [local development](local-development.md) · [deployment](deployment.md) ·
[analytics](analytics.md) · [error monitoring](error-monitoring.md) ·
[rendering and data](../architecture/rendering-and-data.md)

This file is derived from `.env.example` and the readers in the code
(`lib/config/features.ts`, the route handlers under `app/api/`). It does not
replace a private runbook and it contains no secret values.

## Rules

- `NEXT_PUBLIC_*` is inlined into the client bundle. Never put a secret there.
- Server-only names (`GITHUB_TOKEN`, `SPOTIFY_*`, `WAKATIME_API_KEY`,
  `WEATHER_API_KEY`, `SHOW_AVAILABILITY`) must not be prefixed with `NEXT_PUBLIC_`.
- Unset means the related feature is off or the widget falls back. That is the
  intended local and CI behavior, not an error to paper over.

## Catalog

| Name | Where it is read | If unset |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Metadata, canonical URLs | Code falls back to the configured site URL default; do not invent a production host in local docs. Example value in `.env.example` is `https://yannikwuenker.de`. |
| `NEXT_PUBLIC_ANALYTICS_SRC` | Analytics slot | Both analytics vars must be set or the tag is omitted. See [analytics](analytics.md). |
| `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` | Analytics slot | Same as above. |
| `NEXT_PUBLIC_SENTRY_DSN` | Error reporting | Tracking stays off. The DSN is a public ingest key, still not a secret to commit. See [error monitoring](error-monitoring.md). |
| `SHOW_AVAILABILITY` | `lib/config/features.ts` | Off unless the value is exactly `true` or `1`. The hero availability line is absent from the HTML. |
| `WEATHER_API_KEY` | Weather route | Optional. Open-Meteo needs no key. The weather widget is not mounted on a page in this tree. |
| `WEATHER_LOCATION` | Weather route | Example: `Cologne,DE`. |
| `GITHUB_TOKEN` | GitHub activity and latest-commit routes | Server-only. Without it the heatmap route returns `{ available: false }` and the widget keeps its static caption. |
| `GITHUB_USERNAME` | GitHub routes | Example: `spockey4711`. |
| `SPOTIFY_CLIENT_ID` | Now-playing route | Optional. All three Spotify vars are required for that route to return live data. The now-playing widget is not mounted on a page. |
| `SPOTIFY_CLIENT_SECRET` | Now-playing route | Server-only secret. Leave empty in git. |
| `SPOTIFY_REFRESH_TOKEN` | Now-playing route | Server-only. Scopes named in `.env.example`: `user-read-currently-playing`, `user-read-recently-played`. |
| `WAKATIME_API_KEY` | WakaTime route | Server-only. The WakaTime widget is not mounted on a page. |

## Not in this checkout

Host names, SSH users, deploy paths, and registry credentials are not documented
here. [deployment](deployment.md) describes only the public image workflow.

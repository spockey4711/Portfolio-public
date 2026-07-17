# Rendering and data

**Purpose:** how pages are rendered and how live data flows without leaking secrets or
hurting performance.

Related: [tech stack](tech-stack.md) · [project structure](project-structure.md) ·
[environment variables](../../private-docs/docs/operations/environment-variables.md)

## Rendering strategy

The site is content-first, so default to the cheapest thing that works:

- **Static (SSG) by default.** The onepager and legal pages are static — rendered at
  build time, served as HTML. No per-request server work for the bulk of the site.
- **Client interactivity as islands.** Boot overlay, scroll spine, terminal and widgets
  are client components hydrated on top of static HTML. The page is readable and
  meaningful before any JS runs.
- **Server route handlers for live data.** Weather, GitHub activity and now-playing are
  fetched by `app/api/*/route.ts` handlers, cached, and consumed by client widgets. This
  keeps API keys on the server.

Rule of thumb: **static content, client islands, server-only secrets.**

### Self-contained widgets (no live data)

Not every widget talks to a route. The interactive fuelivo proof
(`components/widgets/fuelivo-proof/FuelivoProof.tsx`, S4-5) is a client island whose only
"data" is pure client-side math (`lib/fuelivo/proof.ts`) - no fetch, no route, no secret,
nothing to degrade. It initialises its state from a fixed default input, so the server
render and the first client render compute the identical result (no hydration mismatch,
reserved height, no CLS), then recomputes deterministically on each interaction. Its one
piece of motion (bars easing to their new length) is gated behind `motion-safe:`, so a
reduced-motion visitor gets the same fully-usable widget with values that snap - the static
equivalent. Because it ships no dependencies and does no per-frame or network work, its
code-split chunk hydrates below the fold without moving the fuelivo page's Lighthouse score.

## Live-data flow

```
client widget ──fetch──▶ /app/api/<x>/route.ts ──▶ lib/data/<x>.ts ──▶ external API
     ▲                          │
     └───── JSON, cached ◀──────┘
```

- The widget calls a **same-origin** endpoint (`/api/weather`), never the third party
  directly.
- The route handler reads secrets from server env, calls `lib/data/<x>`, shapes a small
  typed response, and sets cache headers.
- If the upstream fails, the handler returns a typed "unavailable" state; the widget
  renders a graceful fallback (see below), never an error or a layout jump. The failure
  is not silent, though - see [Observability](#observability) below.

### Caching per source

| Data | Source | Cache | Notes |
|---|---|---|---|
| Weather | Open-Meteo (no key) or OpenWeather (key) for Cologne | ~30 min | Coordinates are fixed (Cologne); no user geolocation. |
| Time / timezone | Server clock, formatted for `Europe/Berlin` | none | Can be pure client with `Intl`; no API needed. |
| Location | Static ("Köln, DE") | build-time | Not derived from the visitor. |
| GitHub activity | GitHub REST/GraphQL for `spockey4711` | ~6–24 h | Token only to raise rate limits; store server-side. |
| Latest commit | GitHub REST public events for `spockey4711` | ~15 min | Head commit of the most recent public push, for the signals-of-life feed. Reuses the heatmap's `GITHUB_TOKEN` and requires it, so a secret-less CI/preview degrades quietly and makes no external call (rather than hitting GitHub's unauthenticated per-IP limit). |
| Now-playing | Spotify Web API (optional) | ~30–60 s | Live track, else most recently played (labelled "last played"), else static placeholder. OAuth refresh token needs `user-read-currently-playing` + `user-read-recently-played`, server-side only. Optional feature. |
| Coding stats | WakaTime `stats/last_7_days` (optional) | ~1 h | Last-7-days project breakdown for the widget paired with the GitHub activity. `WAKATIME_API_KEY` authenticates as its own account (`users/current`); server-side only. Optional feature. |

Use Next's caching (`revalidate` / `fetch` cache / route segment config) rather than
hand-rolled timers where possible.

## Graceful degradation (mandatory)

Every live widget must:

1. **Reserve its space** — fixed dimensions so there is no layout shift while loading or
   if data never arrives (protects the "no CLS" quality bar).
2. **Have a static fallback** — the design already specifies placeholder states (e.g.
   `GER · 14:32 CET · 18°C`). If data is unavailable, show a sensible static value or a
   quiet "—", not an error.
3. **Fail independently** — one widget's failure must not affect the rest of the page.
4. **Respect reduced motion** — see [accessibility](../design/accessibility.md).

Because of this, live widgets are **Phase 2+**. The MVP can ship with the static
placeholder values baked in, and the widgets get wired later behind the same visual.

## Observability

Graceful degradation must not become silent breakage: a widget that quietly falls back
for months is a failure nobody notices. So each route handler, before returning the
fallback, logs a genuine upstream failure through `logWidgetFailure`
(`lib/observability/widget-failure.ts`) as one stderr line tagged `[widget:<name>]` -
greppable in deploy logs and enough to back a lightweight uptime/error signal. Only the
widget name and error message are logged, never a token.

The exception is an **unconfigured** optional feature (no `GITHUB_TOKEN`, no Spotify
secrets): the data source throws `WidgetNotConfiguredError`, which is skipped, so
secret-less CI builds and previews do not drown the signal in expected noise. This is the
minimal hook for the widgets; a full error/uptime dashboard is a later, separate step.

## Secrets

No secret is ever imported into a client component or exposed via `NEXT_PUBLIC_*`. All
keys/tokens are server-only and documented in
[environment variables](../../private-docs/docs/operations/environment-variables.md). A build must succeed
with **no** live-data secrets present (widgets fall back), so previews and CI do not need
production keys.

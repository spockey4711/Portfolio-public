---
"portfolio": patch
---

Warm the dev server before the Playwright smoke suite starts. On a cold `pnpm dev`
server, several workers used to send the first request for a route at the same time, and
the same-origin `/api/github-activity` route (wrapped in `unstable_cache`) raced its own
first cache write: Next logged "Unexpected end of JSON input", the browser received a
truncated response and one or two i18n language-toggle tests failed - on a warm server
none did. A `globalSetup` now requests every route the suite visits once, sequentially,
before any worker runs; the route list moves to `tests/e2e/routes.ts` so the i18n suite
and the warm-up share it. Test infrastructure only, no site change.

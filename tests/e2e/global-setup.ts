import { EXTRA_PATHS, ROUTES } from "./routes";

import type { FullConfig } from "@playwright/test";

/**
 * Warm the dev server before the workers start.
 *
 * The smoke suite runs against `pnpm dev`, and a cold Turbopack server compiles each
 * route on its first request. With `fullyParallel` several workers used to send those
 * first requests at once, and the same-origin `/api/github-activity` route - wrapped in
 * `unstable_cache` - then raced its own first cache write: the server logged
 * "SyntaxError: Unexpected end of JSON input" from inside Next, the browser got a
 * truncated response, the dev overlay covered the page and a language-toggle test read
 * `<html lang>` as null. One or two i18n tests failed on a cold server and none on a
 * warm one (PORT-56).
 *
 * So every path the suite visits is requested here once, sequentially, before any test
 * runs: each route compiles exactly once with nobody racing it, and the cache entry
 * exists before the first browser asks for it. Playwright starts the webServer before
 * globalSetup, so the server is already listening. The production build (`PW_PROD`, the
 * visual project) has nothing to compile and is skipped.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  if (process.env.PW_PROD) return;

  const webServer = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;
  const baseURL = webServer?.url;
  if (!baseURL) {
    throw new Error("warm-up: playwright.config.ts must define webServer.url");
  }

  const paths = [...ROUTES.flatMap((route) => [route.de, route.en]), ...EXTRA_PATHS];
  for (const path of paths) {
    const response = await fetch(new URL(path, baseURL));
    // Drain the body so the server finishes the response (and the compile) before the
    // next request; a non-2xx here means the app itself is broken, so fail loudly.
    await response.arrayBuffer();
    if (!response.ok) {
      throw new Error(`warm-up: ${path} responded ${response.status}`);
    }
  }
}

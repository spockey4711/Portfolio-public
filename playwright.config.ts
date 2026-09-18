import { defineConfig, devices } from "@playwright/test";

// Playwright boots the Next.js app itself via the webServer block, so the suites
// work from a clean checkout. Two projects share one Chromium config:
//   - `chromium` (tests/e2e): functional smoke + the axe accessibility scan. Runs
//     against `pnpm dev` (fast). This is what `pnpm test:e2e` runs.
//   - `visual`  (tests/visual): pixel visual-regression snapshots. Runs against a
//     production build (`pnpm start`) so Next's dev indicator never lands in a shot,
//     and only in CI's pinned Playwright container - see docs/engineering/quality-and-testing.md.
// The two projects are always run separately (via --project), so the webServer starts
// once per invocation and PW_PROD selects dev vs prod cleanly.
// PW_PORT lets a run target a non-default port so a dev server from another worktree
// (or the main clone) already on 3000 does not get reused with stale code.
const port = process.env.PW_PORT ? Number(process.env.PW_PORT) : 3000;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  // Requests every route once, sequentially, after the webServer is up and before the
  // workers start, so a cold dev server never compiles (or first-fills a cache entry)
  // under parallel first requests - the race behind the flaky i18n toggle tests
  // (PORT-56). Skips itself under PW_PROD; see tests/e2e/global-setup.ts.
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // A small tolerance absorbs sub-pixel antialiasing noise; real layout regressions
  // move far more than this. Baselines are rendered in the same pinned container that
  // CI verifies against, so parity is otherwise exact.
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  projects: [
    { name: "chromium", testDir: "./tests/e2e", use: { ...devices["Desktop Chrome"] } },
    { name: "visual", testDir: "./tests/visual", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Visual snapshots need the production build (no dev overlay); the functional
    // suite uses the faster dev server. PW_PROD (set by `pnpm test:visual`) selects.
    command: process.env.PW_PROD ? `pnpm start -p ${port}` : `pnpm dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

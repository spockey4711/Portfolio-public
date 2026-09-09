import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import createMDX from "@next/mdx";
import { withSentryConfig } from "@sentry/nextjs/config";

import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (`.next/standalone`) so the Docker
  // runner image needs only the traced dependencies, not the full node_modules.
  output: "standalone",
  // Pin the workspace root so Next does not pick up an unrelated lockfile
  // outside the project (e.g. ~/package-lock.json).
  turbopack: {
    root: projectRoot,
  },
};

// MDX support for the blog (P3-7). Posts live as `.mdx` in content/blog and are
// imported by the /blog routes; `.mdx` is deliberately kept out of pageExtensions
// so a stray file never becomes a route on its own. remark-frontmatter is passed
// by name (not as a function reference) so the same config works under Turbopack,
// which serialises loader options to worker threads. It strips the leading YAML
// `---` block from the rendered output; the frontmatter itself is read separately
// at build time in lib/content/blog.ts. See docs/content/blog.md.
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
  },
});

// Self-hosted error tracking (S6-2). withSentryConfig wraps the build to inject
// the SDK and, crucially, mount a same-origin tunnel route so the browser posts
// error envelopes to the app's own domain (ad-block resilient, and the GlitchTip
// host never appears client-side). It needs no DSN or auth token at build time:
// the DSN is read at runtime from NEXT_PUBLIC_SENTRY_DSN (lib/config/error-tracking.ts),
// and source-map upload is deliberately off, so the build stays secret-free and
// succeeds unconfigured. See docs/operations/error-monitoring.md.
export default withSentryConfig(withMDX(nextConfig), {
  // Route client error reports through the app's origin instead of the DSN host.
  tunnelRoute: "/monitoring",
  // No Sentry build-time chatter or usage telemetry in CI logs.
  silent: true,
  telemetry: false,
  // Upload no source maps: that would need a build-time auth token, and the
  // "build succeeds with no secrets" rule forbids one. Documented as an optional
  // later enhancement in the runbook.
  sourcemaps: { disable: true },
  // Strip the SDK's own debug logging from the client bundle to keep it lean
  // (protects the Lighthouse budget).
  bundleSizeOptimizations: { excludeDebugStatements: true },
});

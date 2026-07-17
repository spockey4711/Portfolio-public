import { afterEach, describe, expect, it } from "vitest";

import { sentryInitOptions } from "@/lib/observability/sentry";

import type { ErrorEvent } from "@sentry/nextjs";

// The shared Sentry init options are the single source of truth for the DSN gate
// and the privacy defaults across server, edge and browser. Guard both, since a
// regression here either silently disables tracking or leaks PII.

const DSN = "NEXT_PUBLIC_SENTRY_DSN";

afterEach(() => {
  delete process.env[DSN];
});

describe("sentryInitOptions", () => {
  it("is null when no DSN is set, so no runtime initialises the SDK", () => {
    expect(sentryInitOptions()).toBeNull();
  });

  it("is errors-only and cookieless when a DSN is set", () => {
    process.env[DSN] = "https://public-key@errors.example.com/1";
    const options = sentryInitOptions();

    expect(options).not.toBeNull();
    expect(options?.dsn).toBe("https://public-key@errors.example.com/1");
    // No performance tracing (Lighthouse budget) and no default PII.
    expect(options?.tracesSampleRate).toBe(0);
    expect(options?.sendDefaultPii).toBe(false);
  });

  it("scrubs the reporter IP and cookie header from an event before sending", () => {
    process.env[DSN] = "https://public-key@errors.example.com/1";
    const beforeSend = sentryInitOptions()?.beforeSend;
    expect(beforeSend).toBeTypeOf("function");

    const event = {
      user: { id: "42", ip_address: "203.0.113.7" },
      request: {
        cookies: { session: "secret" },
        headers: { cookie: "session=secret", Cookie: "session=secret", "user-agent": "UA" },
      },
    } as unknown as ErrorEvent;

    const scrubbed = beforeSend?.(event) as ErrorEvent;

    expect(scrubbed.user).not.toHaveProperty("ip_address");
    expect(scrubbed.request?.headers).not.toHaveProperty("cookie");
    expect(scrubbed.request?.headers).not.toHaveProperty("Cookie");
    expect(scrubbed.request).not.toHaveProperty("cookies");
    // Non-PII context the Datenschutz page discloses (browser/OS) is kept.
    expect(scrubbed.request?.headers).toHaveProperty("user-agent", "UA");
    expect(scrubbed.user).toHaveProperty("id", "42");
  });
});

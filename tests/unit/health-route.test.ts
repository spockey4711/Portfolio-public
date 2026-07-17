import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

// The liveness probe the uptime monitor polls: it must answer 200 with a stable
// { status: "ok" } shape, carry no cache, and leak no request/visitor data. See
// app/api/health/route.ts and docs/operations/error-monitoring.md.

describe("GET /api/health", () => {
  it("returns 200 with a stable ok status and an ISO timestamp", async () => {
    const response = GET();

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(() => new Date(body.time).toISOString()).not.toThrow();
    expect(new Date(body.time).toISOString()).toBe(body.time);
  });

  it("is never cached, so a stale 200 cannot mask a down server", () => {
    const response = GET();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("exposes only status and time - no request or visitor data", async () => {
    const body = await GET().json();
    expect(Object.keys(body).sort()).toEqual(["status", "time"]);
  });
});

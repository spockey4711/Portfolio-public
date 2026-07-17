import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/weather/route";
import { fetchCurrentTemperature } from "@/lib/data/weather";

function stubFetch(implementation: () => Promise<Response>) {
  const mock = vi.fn<(input: unknown) => Promise<Response>>(implementation);
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("fetchCurrentTemperature", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the rounded current temperature for Cologne from Open-Meteo", async () => {
    const mock = stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ current: { temperature_2m: 18.4 } }), { status: 200 }),
      ),
    );

    await expect(fetchCurrentTemperature()).resolves.toBe(18);

    const requestedUrl = String(mock.mock.calls[0]?.[0]);
    expect(requestedUrl).toContain("api.open-meteo.com");
    expect(requestedUrl).toContain("current=temperature_2m");
  });

  it("throws on a non-OK upstream response", async () => {
    stubFetch(() => Promise.resolve(new Response("", { status: 503 })));
    await expect(fetchCurrentTemperature()).rejects.toThrow();
  });

  it("throws when the payload has no numeric temperature", async () => {
    stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify({ current: {} }), { status: 200 })),
    );
    await expect(fetchCurrentTemperature()).rejects.toThrow();
  });
});

describe("GET /api/weather", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the available temperature with a cache header on success", async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ current: { temperature_2m: 5.2 } }), { status: 200 }),
      ),
    );

    const response = await GET();
    expect(response.headers.get("Cache-Control")).toContain("s-maxage");
    await expect(response.json()).resolves.toEqual({ available: true, temperatureC: 5 });
  });

  it("degrades to an unavailable state and logs when the upstream fails", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(() => Promise.reject(new Error("network")));

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ available: false });
    // The failure is observable, not silent.
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining("[widget:weather]"));
  });
});

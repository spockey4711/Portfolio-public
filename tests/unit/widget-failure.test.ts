import { afterEach, describe, expect, it, vi } from "vitest";

import { logWidgetFailure, WidgetNotConfiguredError } from "@/lib/observability/widget-failure";

describe("logWidgetFailure", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs a tagged, greppable line with the widget name and error message", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logWidgetFailure("weather", new Error("Open-Meteo responded 503"));

    expect(error).toHaveBeenCalledTimes(1);
    const line = String(error.mock.calls[0]?.[0]);
    expect(line).toContain("[widget:weather]");
    expect(line).toContain("Open-Meteo responded 503");
  });

  it("stringifies a non-Error thrown value", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logWidgetFailure("now-playing", "boom");

    expect(String(error.mock.calls[0]?.[0])).toContain("boom");
  });

  it("stays silent for an intentionally unconfigured feature", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logWidgetFailure("github-activity", new WidgetNotConfiguredError("GITHUB_TOKEN is not set"));

    expect(error).not.toHaveBeenCalled();
  });

  it("never leaks a secret-bearing token: only the message is logged", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("Spotify token endpoint responded 400");
    // A stack or extra field must not reach the log; only `message` is used.
    const sensitiveValue = "placeholder-token-value";
    (failure as unknown as { token: string }).token = sensitiveValue;

    logWidgetFailure("now-playing", failure);

    expect(String(error.mock.calls[0]?.[0])).not.toContain(sensitiveValue);
  });
});

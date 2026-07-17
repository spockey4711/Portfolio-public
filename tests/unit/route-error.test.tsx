import * as Sentry from "@sentry/nextjs";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteError } from "@/components/error/RouteError";
import { getCopy } from "@/content/copy";

// The error boundary reports to Sentry on mount; mock the SDK so the test asserts
// the reporting contract without a real transport. vitest hoists vi.mock above
// the imports, so mocking still applies to the `Sentry` import above.
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const captureException = vi.mocked(Sentry.captureException);

afterEach(() => {
  captureException.mockClear();
});

function renderError(reset = vi.fn()) {
  const error = Object.assign(new Error("boom"), { digest: "abc123" });
  render(<RouteError error={error} reset={reset} locale="de" />);
  return { error, reset };
}

describe("RouteError", () => {
  it("reports the caught error to the error tracker once on mount", () => {
    const { error } = renderError();

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(error);
  });

  it("shows the localized terminal error surface, not a raw stack", () => {
    renderError();
    const copy = getCopy("de").error;

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(copy.heading);
    expect(screen.getByText(copy.body)).toBeInTheDocument();
    // The thrown message must not be surfaced to the visitor.
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
  });

  it("re-renders the crashed segment when the retry button is pressed", () => {
    const { reset } = renderError();
    const copy = getCopy("de").error;

    fireEvent.click(screen.getByRole("button", { name: copy.retry }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("offers a link back to the homepage", () => {
    renderError();
    const copy = getCopy("de").error;

    expect(screen.getByRole("link", { name: copy.home.label })).toHaveAttribute(
      "href",
      copy.home.href,
    );
  });
});

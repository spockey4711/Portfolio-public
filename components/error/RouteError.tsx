"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { getCopy } from "@/content/copy";
import { type Locale } from "@/lib/i18n/locale";

/**
 * Terminal-style runtime-error surface, shared by the per-locale route error
 * boundaries (app/(de)/error.tsx, app/(en)/error.tsx). It reuses the 404's
 * terminal motif - the dark card, chrome bar and green prompt glyph - so an
 * unexpected crash still speaks in the site's voice rather than showing a raw
 * stack or a blank page.
 *
 * A client component because Next.js error boundaries must be (`"use client"`),
 * and because it reports the caught error to the self-hosted GlitchTip tracking
 * (S6-2) on mount. Reporting is guarded to run once per error via the effect's
 * dependency, and `captureException` is a no-op when the SDK is not configured,
 * so an unconfigured build simply renders the fallback and sends nothing.
 *
 * `reset` re-renders the crashed segment (a transient error may then succeed);
 * the CTA links home for a hard failure. Accessibility mirrors NotFoundTerminal:
 * the message is a real <h1> + paragraph, the glyphs are aria-hidden, and the
 * <main id="main"> is the skip-link target.
 */

export interface RouteErrorProps {
  /** The error the boundary caught. `digest` is set for server-thrown errors. */
  error: Error & { digest?: string };
  /** Re-renders the segment that threw. Provided by Next.js. */
  reset: () => void;
  locale: Locale;
}

export function RouteError({ error, reset, locale }: RouteErrorProps) {
  const err = getCopy(locale).error;

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-[680px] flex-1 flex-col justify-center px-6 pt-32 pb-28 outline-none sm:px-10"
    >
      <section
        aria-label={err.regionLabel}
        className="overflow-hidden rounded-card border border-term-border bg-term-bg font-mono text-[13px] shadow-widget"
      >
        {/* Chrome bar: two inert dots, one green, and the working-directory caption. */}
        <div className="flex items-center gap-2 border-b border-term-border px-4 py-3">
          <span aria-hidden className="size-2.5 rounded-full bg-term-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-term-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-term-green" />
          <span className="ml-2 text-[11px] tracking-[0.5px] text-term-text-faint">
            {err.title}
          </span>
        </div>

        {/* Body: the failed command, its error line, and the human message. */}
        <div className="flex flex-col gap-4 p-5 leading-[1.7]">
          <div>
            <p className="break-words text-term-text">
              <span aria-hidden className="text-term-green">
                {err.prompt}{" "}
              </span>
              {err.command}
            </p>
            <p className="break-words text-term-text-muted">{err.errorLine}</p>
          </div>

          <h1 className="text-term-text">
            <span className="text-term-green">{err.code}</span> {err.heading}
          </h1>
          <p className="text-term-text-muted">{err.body}</p>

          {/* Live prompt row with a blinking block cursor - the terminal at rest. */}
          <p aria-hidden className="text-term-green">
            {err.prompt} <span className="motion-safe:animate-blink">▮</span>
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-4">
        <Button variant="primary" onClick={reset}>
          {err.retry}
        </Button>
        <Button href={err.home.href} variant="secondary">
          {err.home.label}
        </Button>
      </div>
    </main>
  );
}

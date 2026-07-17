"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { getCopy } from "@/content/copy";
import { type Locale } from "@/lib/i18n/locale";

/**
 * Terminal-style 404 (app/not-found.tsx). It reuses the terminal widget's motif
 * - the dark card, chrome bar with three dots and the green prompt glyph - so an
 * unmatched route lands the visitor in the same "developer terminal" the site
 * already speaks in, rather than a generic error page.
 *
 * A client island only because it echoes the requested path (`usePathname`) as a
 * failed `cd`, which reads as an authentic shell error. Everything else is static
 * copy read per-locale via getCopy(locale). The block cursor blinks under
 * `motion-safe` only, so reduced-motion users get a static caret (like the widget).
 *
 * Accessibility: the real message lives in a proper <h1> and body paragraph, so
 * the 404 is conveyed as text, not just terminal decoration. The prompt/error
 * glyphs are aria-hidden. This <main id="main"> is the skip-link target here.
 */

export function NotFoundTerminal({ locale }: { locale: Locale }) {
  const nf = getCopy(locale).notFound;
  // The attempted path, echoed as the failed command. Falls back to "/" if the
  // router has not resolved a pathname (it always does for an unmatched route).
  const pathname = usePathname() || "/";

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-[680px] flex-1 flex-col justify-center px-6 pt-32 pb-28 outline-none sm:px-10"
    >
      <section
        aria-label={nf.regionLabel}
        className="overflow-hidden rounded-card border border-term-border bg-term-bg font-mono text-[13px] shadow-widget"
      >
        {/* Chrome bar: two inert dots, one green, and the working-directory caption. */}
        <div className="flex items-center gap-2 border-b border-term-border px-4 py-3">
          <span aria-hidden className="size-2.5 rounded-full bg-term-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-term-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-term-green" />
          <span className="ml-2 text-[11px] tracking-[0.5px] text-term-text-faint">{nf.title}</span>
        </div>

        {/* Body: the failed command, the message, and an ls-style set of links. */}
        <div className="flex flex-col gap-4 p-5 leading-[1.7]">
          <div>
            <p className="break-words text-term-text">
              <span aria-hidden className="text-term-green">
                {nf.prompt}{" "}
              </span>
              {nf.command} {pathname}
            </p>
            <p className="break-words text-term-text-muted">
              {nf.error} {pathname}
            </p>
          </div>

          <h1 className="text-term-text">
            <span className="text-term-green">{nf.code}</span> {nf.heading}
          </h1>
          <p className="text-term-text-muted">{nf.body}</p>

          <div>
            <p className="text-term-text">
              <span aria-hidden className="text-term-green">
                {nf.prompt}{" "}
              </span>
              {nf.linksCommand}
            </p>
            <ul className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
              {nf.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-term-green underline-offset-4 transition-colors duration-200 hover:text-term-text hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Live prompt row with a blinking block cursor - the terminal at rest. */}
          <p aria-hidden className="text-term-green">
            {nf.prompt} <span className="motion-safe:animate-blink">▮</span>
          </p>
        </div>
      </section>

      <div className="mt-8">
        <Button href={nf.home.href} variant="primary">
          {nf.home.label}
        </Button>
      </div>
    </main>
  );
}

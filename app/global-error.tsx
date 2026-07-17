"use client";

import { RouteError, type RouteErrorProps } from "@/components/error/RouteError";
import { defaultLocale, localeTag } from "@/lib/i18n/locale";

import { fontVariables } from "./fonts";

import "./globals.css";

// The last-resort boundary: it replaces the root layout when the layout itself
// throws, so - like app/not-found.tsx, and because the two locale root layouts
// (app/(de), app/(en)) share no parent layout - it must render its own
// <html>/<body> shell rather than relying on one above it. It falls back to the
// default (German) locale and reuses the shared terminal error surface, which
// reports the error to GlitchTip (S6-2) on mount.
export default function GlobalError({ error, reset }: Omit<RouteErrorProps, "locale">) {
  return (
    <html
      lang={localeTag[defaultLocale]}
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <RouteError error={error} reset={reset} locale={defaultLocale} />
      </body>
    </html>
  );
}

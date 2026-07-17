import { SiteChrome } from "@/components/chrome/SiteChrome";
import { NotFoundTerminal } from "@/components/not-found/NotFoundTerminal";
import { defaultLocale, localeTag } from "@/lib/i18n/locale";

import { fontVariables } from "./fonts";

import type { Metadata } from "next";

import "./globals.css";

// The global 404 for URLs that match no route. With two locale root layouts
// (app/(de), app/(en)) there is no shared root layout to wrap this boundary, so
// unlike a normal page it must render its own <html>/<body> shell. It falls back
// to the default (German) locale and reuses the shared body chrome. The 404
// carries no SEO value and must not rank; noindex/follow like the legal pages
// (docs/content/seo.md).
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <html
      lang={localeTag[defaultLocale]}
      data-scroll-behavior="smooth"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <SiteChrome locale={defaultLocale}>
          <NotFoundTerminal locale={defaultLocale} />
        </SiteChrome>
      </body>
    </html>
  );
}

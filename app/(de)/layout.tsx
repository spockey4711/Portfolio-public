import { SiteChrome } from "@/components/chrome/SiteChrome";
import { localeTag } from "@/lib/i18n/locale";
import { buildRootMetadata } from "@/lib/seo/metadata";

import { fontVariables } from "../fonts";

import type { Metadata } from "next";

import "../globals.css";

// The German (canonical, unprefixed) root layout. One of the site's two root
// layouts: it owns the <html lang="de-DE"> shell and the German metadata, and
// defers the shared body chrome to <SiteChrome locale="de">. Its English twin
// lives in app/(en)/layout.tsx; only the enclosing <html lang> and the locale
// passed down differ between them. See docs/content/i18n.md.
const locale = "de";

export const metadata: Metadata = buildRootMetadata(locale);

export { viewport } from "@/lib/seo/metadata";

export default function DeRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the pre-paint boot guard (BOOT_GUARD_SCRIPT in
    // SiteChrome) sets data-boot="play" on <html> before React hydrates, so the
    // server HTML (no marker) intentionally differs from the client DOM. This
    // suppresses the warning for this element's attributes only (one level deep).
    <html
      lang={localeTag[locale]}
      // globals.css sets scroll-behavior: smooth for the nav anchor jumps;
      // data-scroll-behavior makes that intent explicit to Next's router (and
      // silences its route-transition warning). Reduced motion still turns it off.
      data-scroll-behavior="smooth"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </body>
    </html>
  );
}

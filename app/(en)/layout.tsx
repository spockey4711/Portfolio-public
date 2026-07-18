import { SiteChrome } from "@/components/chrome/SiteChrome";
import { localeTag } from "@/lib/i18n/locale";
import { buildRootMetadata } from "@/lib/seo/metadata";

import { fontVariables } from "../fonts";

import type { Metadata } from "next";

import "../globals.css";

// The English (/en) root layout, twin of app/(de)/layout.tsx: it owns the
// <html lang="en"> shell and the English metadata, and defers the shared body
// chrome to <SiteChrome locale="en">. Only the enclosing <html lang> and the
// locale passed down differ between the two roots. See docs/content/i18n.md.
const locale = "en";

export const metadata: Metadata = buildRootMetadata(locale);

export { viewport } from "@/lib/seo/metadata";

export default function EnRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: see app/(de)/layout.tsx - the pre-paint theme init
    // mutates <html> before hydration, so the server and client markup differ here.
    <html
      lang={localeTag[locale]}
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

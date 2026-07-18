import { Analytics } from "@/components/analytics/Analytics";
import { Footer } from "@/components/chrome/Footer";
import { Nav } from "@/components/chrome/Nav";
import { ViewTransitionProvider } from "@/components/chrome/view-transitions";
import { JsonLd } from "@/components/seo/JsonLd";
import { CommandPalette } from "@/components/widgets/command-palette/CommandPalette";
import { getCopy } from "@/content/copy";
import { THEME_INIT_SCRIPT } from "@/lib/chrome/theme";
import { type Locale } from "@/lib/i18n/locale";
import { personJsonLd } from "@/lib/seo/structured-data";

/**
 * The shared body chrome rendered by both locale root layouts (app/(de) and
 * app/(en)): the skip link, the Person JSON-LD, the pre-paint theme script, the
 * nav, the routed page content (wrapped in the view-transition provider) and the
 * footer, plus the global command palette.
 * Everything here is locale-parameterized so the same tree renders in German or
 * English; only the enclosing <html lang> differs between the two layouts.
 */
export function SiteChrome({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const { nav } = getCopy(locale);

  return (
    <>
      {/* Skip link: the first tab stop, so keyboard users jump past the fixed
          nav to the main content. Off-screen until focused, then it slides into
          the top-left (docs/design/accessibility.md). */}
      <a
        href="#main"
        className="sr-only rounded-button bg-pine px-4 py-2 font-mono text-sm text-surface focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[200]"
      >
        {nav.skipToContent}
      </a>
      {/* Person structured data (schema.org) so search engines can attach a
          structured identity to the name; see lib/seo/structured-data.ts. */}
      <JsonLd data={personJsonLd(locale)} />
      {/* Pre-paint theme init: resolves the persisted choice or the system
          preference and sets data-theme on <html> before first paint, so dark
          mode never flashes the wrong theme (S4-2, see lib/chrome/theme.ts). */}
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {/* Self-hosted, cookieless Umami tag; renders only when analytics is
          configured, else nothing (S2-5, see components/analytics/Analytics.tsx). */}
      <Analytics />
      <Nav locale={locale} />
      {/* Animates route changes with the View Transitions API where supported;
          a no-op under reduced motion or in browsers without it (S2-7). Wraps
          only the routed children, which is what changes on navigation. */}
      <ViewTransitionProvider>{children}</ViewTransitionProvider>
      <Footer locale={locale} />
      {/* Global ⌘K launcher: unifies section/route navigation and the terminal
          commands. Mounted here so the shortcut works on every route (S2-6). */}
      <CommandPalette locale={locale} />
    </>
  );
}

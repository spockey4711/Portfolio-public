import Link from "next/link";

import { getCopy } from "@/content/copy";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated } from "@/lib/i18n/routes";

import { version } from "../../package.json";

/**
 * The site footer, colophon register: a dense mono block that closes the page the
 * way a print colophon closes a book - owner and year, the typefaces and stack it
 * is set in, and the release version - followed by one inline row of links (the
 * explore destinations, then the legal pages). Mounted in the root layout, so the
 * legal pages carry it too.
 *
 * The footer stays the site's home for page-level links, kept out of the
 * scroll-only primary nav by design (ADR-0005). Explore uses next/link for client
 * navigation; the legal links stay plain anchors. The year is computed on the
 * server, so there is no client JS for it and no hydration mismatch. All strings
 * come from content/copy per locale; cross-page links whose English route has not
 * shipped yet are filtered out so the English footer never shows a dead link.
 */
export function Footer({ locale }: { locale: Locale }) {
  const { footer } = getCopy(locale);
  const year = new Date().getFullYear();

  const exploreLinks = footer.explore.links.filter((link) => isRouteTranslated(link.route, locale));
  const legalLinks = footer.legal.filter((link) => isRouteTranslated(link.route, locale));

  return (
    <footer className="border-t-2 border-ink">
      <div className="mx-auto flex w-full max-w-(--container-max) flex-col gap-5 px-6 py-10 sm:px-10 lg:px-14">
        <p className="max-w-[68ch] font-mono text-xs leading-relaxed text-muted">
          © {year} {footer.owner} · v{version} · {footer.colophon}
        </p>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {exploreLinks.length > 0 ? (
            <nav aria-label={footer.explore.label}>
              <ul className="flex list-none flex-wrap items-center gap-6">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-mono text-xs tracking-[1px] whitespace-nowrap text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {legalLinks.length > 0 ? (
            <nav aria-label={footer.label}>
              <ul className="flex list-none flex-wrap items-center gap-6">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="font-mono text-xs tracking-[1px] whitespace-nowrap text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

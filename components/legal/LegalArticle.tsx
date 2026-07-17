import Link from "next/link";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { getLegalChrome } from "@/content/legal";
import type { LegalPage } from "@/content/legal";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Shared renderer for a legal page (Impressum, Datenschutz - P1-13; localized in
 * S5-1e). Takes a structured LegalPage from content/legal.ts plus its locale and
 * renders it as a narrow, readable prose column: a mono eyebrow and serif H1, an
 * optional lead, then the sections (H2 plus paragraphs, a semantic <address>,
 * links and/or a list), and a "Stand"/"Last updated" marker. The locale-aware
 * chrome (eyebrow, labels and the back link, which returns to the locale's
 * onepager since the fixed nav's section anchors do not resolve here) comes from
 * getLegalChrome(locale).
 */
export function LegalArticle({ page, locale }: { page: LegalPage; locale: Locale }) {
  const legalChrome = getLegalChrome(locale);
  return (
    <main className="mx-auto w-full max-w-[760px] px-6 pt-32 pb-28 sm:px-10">
      <Link
        href={legalChrome.backToHome.href}
        className="font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
      >
        {legalChrome.backToHome.label}
      </Link>

      <header className="mt-10 flex flex-col gap-4">
        <MonoLabel tone="pine" className="tracking-[2px]">
          {legalChrome.eyebrow}
        </MonoLabel>
        <h1 className="font-display text-[clamp(2rem,5vw,2.875rem)] leading-[1.08] tracking-[-0.01em] text-ink">
          {page.title}
        </h1>
        {page.intro ? (
          <p className="max-w-[60ch] font-sans text-lg leading-relaxed text-ink-soft">
            {page.intro}
          </p>
        ) : null}
      </header>

      <div className="mt-14 flex flex-col gap-12">
        {page.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-4">
            <h2 className="font-display text-2xl leading-snug text-ink">{section.heading}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="font-sans leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            ))}

            {section.address ? (
              <address className="font-sans leading-relaxed text-ink-soft not-italic">
                {section.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ) : null}

            {section.links?.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="w-fit font-sans text-pine underline underline-offset-4 transition-colors duration-200 hover:text-signal"
              >
                {link.label}
              </a>
            ))}

            {section.items ? (
              <ul className="flex list-disc flex-col gap-2 pl-5 font-sans leading-relaxed text-ink-soft">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <p className="mt-14 border-t border-line pt-6">
        <MonoLabel tone="muted">
          {legalChrome.lastUpdatedLabel}: {page.lastUpdated}
        </MonoLabel>
      </p>
    </main>
  );
}

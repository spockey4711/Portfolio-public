import { Tile } from "@/components/sections/bento/Tile";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCopy } from "@/content/copy";
import { type Locale } from "@/lib/i18n/locale";

/**
 * The Contact tile (P1-12), the grid's loud closing band: the one amber-filled
 * tile on the page (the Pressroom duo never blends - everything inside stays
 * ink-on-amber). The lead reads as the display statement, email is the single
 * prominent CTA, and the direct channels follow as a quiet mono row. The CV
 * download lives with the Werdegang timeline, not here. All strings come from
 * content/copy per locale.
 */
export function Contact({ locale, className }: { locale: Locale; className?: string }) {
  const { contact } = getCopy(locale);

  return (
    <Tile tone="amber" id="kontakt" aria-labelledby="kontakt-title" className={className}>
      <div className="flex flex-col gap-8 py-2 sm:py-4">
        <SectionHeader title={contact.title} className="[&_span]:text-accent-ink" />
        <h2 id="kontakt-title" className="sr-only">
          {contact.title}
        </h2>

        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <p className="max-w-[22ch] font-display text-[clamp(1.875rem,4vw,3rem)] leading-[1.06] font-extrabold tracking-[0.02em] text-accent-ink uppercase">
            {contact.lead}
          </p>

          <div className="flex flex-col items-start gap-5">
            <Button variant="secondary" href={contact.cta.href}>
              {contact.cta.label}
              <span aria-hidden>→</span>
            </Button>

            <ul className="flex list-none flex-wrap items-center gap-x-6 gap-y-2">
              <li>
                <a
                  href={contact.channels.email.href}
                  className="font-mono text-sm whitespace-nowrap text-accent-ink underline decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-accent-ink/40"
                >
                  {contact.channels.email.label}
                </a>
              </li>
              <li>
                <a
                  href={contact.channels.linkedin.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm whitespace-nowrap text-accent-ink underline decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-accent-ink/40"
                >
                  {contact.channels.linkedin.label} <span aria-hidden>↗</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.channels.github.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm whitespace-nowrap text-accent-ink underline decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-accent-ink/40"
                >
                  {contact.channels.github.label} <span aria-hidden>↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Tile>
  );
}

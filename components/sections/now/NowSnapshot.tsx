import Link from "next/link";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { getNow, getNowChrome, type NowEntry } from "@/content/now";
import { type Locale } from "@/lib/i18n/locale";

/**
 * The Now-page body (S3-3, IA level 2): a dated snapshot of the current focus.
 * Shared by both locale routes (de at /jetzt, en at /en/now per S5-1d) exactly
 * like UsesInventory and ProjectsIndex, so the two trees render the same structure
 * and only the resolved content differs. The routes own their metadata; this owns
 * the markup. The back link targets the onepager home, which carries no hash, so a
 * plain string href is enough. All copy resolves via getNow(locale)/getNowChrome(locale).
 */

/** Renders a single entry: a linked or plain label with an optional detail line. */
function NowEntryItem({ entry }: { entry: NowEntry }) {
  const label = entry.href ? (
    <a
      href={entry.href}
      className="font-sans text-ink underline underline-offset-4 transition-colors duration-200 hover:text-signal"
    >
      {entry.label}
    </a>
  ) : (
    <span className="font-sans text-ink">{entry.label}</span>
  );

  return (
    <li className="flex flex-col gap-1">
      {label}
      {entry.detail ? (
        <span className="font-sans leading-relaxed text-ink-soft">{entry.detail}</span>
      ) : null}
    </li>
  );
}

export function NowSnapshot({ locale }: { locale: Locale }) {
  const now = getNow(locale);
  const chrome = getNowChrome(locale);

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 pt-32 pb-28 sm:px-10">
      <Link
        href={chrome.backToHome.href}
        className="font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
      >
        {chrome.backToHome.label}
      </Link>

      <header className="mt-10 flex flex-col gap-4">
        <MonoLabel tone="pine" className="tracking-[2px]">
          {now.eyebrow}
        </MonoLabel>
        <h1 className="font-display text-[clamp(2rem,5vw,2.875rem)] leading-[1.08] tracking-[-0.01em] text-ink">
          {now.title}
        </h1>
        <p className="max-w-[60ch] font-sans text-lg leading-relaxed text-ink-soft">{now.intro}</p>
      </header>

      <div className="mt-14 flex flex-col gap-12">
        {now.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-4">
            <h2 className="font-display text-2xl leading-snug text-ink">{section.heading}</h2>
            <ul className="flex list-none flex-col gap-5">
              {section.entries.map((entry) => (
                <NowEntryItem key={entry.label} entry={entry} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-14 border-t border-line pt-6">
        <MonoLabel tone="muted">
          {chrome.lastUpdatedLabel}: {now.lastUpdated}
        </MonoLabel>
      </p>
    </main>
  );
}

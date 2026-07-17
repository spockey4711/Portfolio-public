import Link from "next/link";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCopy } from "@/content/copy";
import { getUsesGroups } from "@/content/uses";
import { type Locale } from "@/lib/i18n/locale";

/**
 * The /uses inventory body (S3-4, IA level 2): the hardware, editor, stack and
 * tools actually in use. Shared by both locale routes (de at /uses, en at
 * /en/uses) exactly like ProjectsIndex and Onepager, so the two trees render the
 * same structure and only the resolved copy/content differs. The routes own their
 * metadata; this owns the markup. The back link targets the onepager home, which
 * carries no hash, so a plain string href is enough (unlike the projects index).
 */
export function UsesInventory({ locale }: { locale: Locale }) {
  const { uses } = getCopy(locale);
  const groups = getUsesGroups(locale);

  return (
    <main className="mx-auto w-full max-w-(--container-max) px-6 pt-32 pb-28 sm:px-10 lg:pr-14 lg:pl-26">
      <Link
        href={uses.backToOnepager.href}
        className="font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
      >
        {uses.backToOnepager.label}
      </Link>

      <header className="mt-10 flex flex-col gap-4">
        <MonoLabel tone="pine" className="tracking-[2px]">
          {uses.eyebrow}
        </MonoLabel>
        <h1 className="font-display text-[clamp(2rem,5vw,2.875rem)] leading-[1.08] tracking-[-0.01em] text-ink">
          {uses.title}
        </h1>
        <p className="max-w-[60ch] font-sans text-lg leading-relaxed text-ink-soft">{uses.intro}</p>
      </header>

      <div className="mt-16 flex flex-col gap-14">
        {groups.map((group, index) => (
          <section
            key={group.title}
            aria-labelledby={`uses-${index}`}
            className="flex flex-col gap-6"
          >
            <SectionHeader title={group.title} />
            <h2 id={`uses-${index}`} className="sr-only">
              {group.title}
            </h2>

            <dl className="grid grid-cols-1 gap-x-15 gap-y-5 sm:grid-cols-2">
              {group.items.map((item) => (
                <div key={item.name} className="flex flex-col gap-1">
                  <dt className="font-sans text-base font-medium text-ink">{item.name}</dt>
                  {item.note ? (
                    <dd className="font-mono text-xs leading-relaxed text-muted">{item.note}</dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </main>
  );
}

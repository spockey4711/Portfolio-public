import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCopy } from "@/content/copy";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The About section (P1-9): the display headline stacked over the plain
 * first-person body. It reads as who he is and how he works - the sport
 * connection and the hands-on register - not as a manufactured origin story. The
 * accent word carries the emphasis in slate (headings never italicise). All
 * strings come from content/copy per locale.
 *
 * Open prose, not a tile: on the landing page it sits straight on the paper
 * background as one of the editorial bands (Onepager.tsx), so the page alternates
 * open passages with framed instrument clusters instead of reading as boxes.
 */
export function About({ locale, className }: { locale: Locale; className?: string }) {
  const { about } = getCopy(locale);

  return (
    <section
      id="ueber"
      aria-labelledby="ueber-title"
      className={cn("flex flex-col gap-5", className)}
    >
      <SectionHeader title={about.title} />

      <h2
        id="ueber-title"
        className="max-w-[16ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.06] font-extrabold tracking-[0.02em] text-ink uppercase"
      >
        {about.headline.lead} <span className="text-pine">{about.headline.accent}</span>{" "}
        {about.headline.tail}
      </h2>

      <div className="flex max-w-[58ch] flex-col gap-4">
        {about.body.map((paragraph) => (
          <p key={paragraph} className="font-sans leading-relaxed text-ink-soft">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

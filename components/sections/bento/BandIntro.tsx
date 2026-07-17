import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";

/**
 * The interstitial lead-in that introduces a framed instrument cluster on the
 * paper background: a mono eyebrow over one plain sentence. It is the page's
 * "background with text" beat - an open editorial moment right before the boxes
 * resume - so the cluster below reads as a deliberate object, not just the next
 * row of tiles. Copy lives under `landing.*` in content/copy, one entry per
 * cluster. The sentence stays sans (not the uppercase display of the section
 * headings) so it reads as running prose on the page, not as another headline.
 */
export function BandIntro({
  eyebrow,
  lead,
  className,
}: {
  eyebrow: string;
  lead: string;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-[52ch] flex-col gap-4", className)}>
      <SectionHeader title={eyebrow} />
      <p className="font-sans text-xl leading-relaxed text-ink-soft sm:text-2xl">{lead}</p>
    </div>
  );
}

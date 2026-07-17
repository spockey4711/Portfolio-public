import Image from "next/image";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type { Project } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * A project's cover visual. When `media.cover` is set it renders the screenshot
 * as a captioned figure chosen by `media.orientation`: a landscape shot with the
 * live domain as a typographic caption bar (a web-app product shot, the default)
 * or an upright portrait shot in its real proportions instead of cropped to the
 * landscape box. Deliberately no re-drawn browser or phone chrome - the caption
 * does the "this is the real app" work. When no cover exists it falls back to the
 * diagonal striped placeholder, captioned with the slug so it reads as an
 * intentional slot rather than a broken image (see docs/content/projects.md).
 */
export type ProjectMediaProps = {
  project: Project;
  locale: Locale;
  className?: string;
};

/** The bare hostname of the live site (e.g. "fuelivo.de"), shown in the caption bar. */
function liveHost(project: Project): string | null {
  const live = project.links?.live;
  if (!live) return null;
  try {
    return new URL(live).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function ProjectMedia({ project, locale, className }: ProjectMediaProps) {
  const cover = project.media?.cover;
  const coverAlt = `${getCopy(locale).projects.labels.coverAlt} ${project.name}`;

  if (cover && project.media?.orientation === "portrait") {
    // A native app screenshot: show it upright in a phone frame, centered on the
    // frame's surface, so its real 9:19.5 proportions are kept instead of being
    // cropped to the landscape box the browser frame uses.
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-visual border border-line bg-surface p-5",
          className,
        )}
      >
        <div className="relative [aspect-ratio:9/19.5] h-full max-h-full overflow-hidden rounded-visual border border-line-strong bg-bg">
          {/* The gentle zoom only fires when an ancestor carries `group` (the
              linked ProjectCard) and motion is allowed; the frame clips it, and
              the static FeaturedProject shot never triggers it. */}
          <Image
            src={cover}
            alt={coverAlt}
            fill
            className="object-cover object-top transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03]"
            sizes="(max-width: 900px) 60vw, 25vw"
          />
        </div>
      </div>
    );
  }

  if (cover) {
    const host = liveHost(project);
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-visual border border-line bg-surface",
          className,
        )}
      >
        {/* Typographic caption bar: the live domain set as a print caption above
            the shot - never re-drawn browser chrome (no fake dots, no URL pill). */}
        {host ? (
          <div className="flex h-8 shrink-0 items-center border-b border-line bg-bg px-3">
            <span className="font-mono text-[11px] tracking-[0.5px] text-ink-soft">{host}</span>
          </div>
        ) : null}
        <div className="relative flex-1">
          {/* Same card-hover zoom as the portrait frame; see the note there. */}
          <Image
            src={cover}
            alt={coverAlt}
            fill
            className="object-cover object-top transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03]"
            sizes="(max-width: 900px) 100vw, 45vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-visual border border-line bg-surface",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,var(--line)_0,var(--line)_1px,transparent_1px,transparent_11px)]"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <MonoLabel tone="muted">{`[ ${project.slug} ]`}</MonoLabel>
      </div>
    </div>
  );
}

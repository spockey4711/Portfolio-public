import { getProjectStatusLabels, type ProjectStatus } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The project status shown as text plus a colour-coded dot. The localized label is
 * always rendered, so the status never relies on colour alone (accessibility).
 * Colour follows the token rule from the design system: the live state glows in
 * `signal` (the dot) with its resting label in the AA-conformant `signal-ink` (the
 * badge can sit directly on `--bg`, where plain `signal` misses 4.5:1); `pine` for a
 * built core; the quieter `moss`/`muted` for a plan or a learning project.
 */
export type ProjectStatusBadgeProps = {
  status: ProjectStatus;
  locale: Locale;
  className?: string;
};

const statusStyles: Record<ProjectStatus, { dot: string; text: string }> = {
  live: { dot: "bg-signal", text: "text-signal-ink" },
  mvp: { dot: "bg-pine", text: "text-pine" },
  concept: { dot: "bg-moss", text: "text-moss" },
  experiment: { dot: "bg-muted", text: "text-muted" },
};

export function ProjectStatusBadge({ status, locale, className }: ProjectStatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs tracking-[1px] uppercase",
        style.text,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", style.dot)} />
      {getProjectStatusLabels(locale)[status]}
    </span>
  );
}

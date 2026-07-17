import { cn } from "@/lib/utils/cn";

/**
 * The trailing arrow glyph on a link or CTA. It nudges a couple of pixels in its
 * travel direction when the enclosing control is hovered or receives keyboard
 * focus - a small "this goes somewhere" affordance that makes the interaction feel
 * intentional rather than decorative. The parent control must carry `group` (every
 * `Button` does; ghost text links add it) so the same move fires for pointer hover
 * and `:focus-visible` alike, keeping keyboard and mouse in step.
 *
 * The travel is `motion-safe` only, so reduced-motion users get the static glyph
 * with no movement (docs/design/animation-and-motion.md). It is always decorative:
 * `aria-hidden`, since the link's text carries the meaning.
 */
export type ArrowDirection = "right" | "up-right";

export type ArrowAffordanceProps = {
  /** "right" for in-site/forward links (→); "up-right" for external links (↗). */
  direction?: ArrowDirection;
  className?: string;
};

// The nudge per direction: forward links slide right; external links lift up-right
// along the glyph's own diagonal. Both hover and keyboard focus trigger the move.
const NUDGE: Record<ArrowDirection, string> = {
  right: "motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:translate-x-0.5",
  "up-right":
    "motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5",
};

export function ArrowAffordance({ direction = "right", className }: ArrowAffordanceProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block transition-transform duration-200 ease-out",
        NUDGE[direction],
        className,
      )}
    >
      {direction === "up-right" ? "↗" : "→"}
    </span>
  );
}

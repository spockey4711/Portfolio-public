import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * One cell of the landing page's bento grid (see Onepager.tsx): a print slab -
 * 2px ink border, hard-offset shadow, square corners - in one of three fills.
 * `paper` is the default surface; `amber` and `slate` are the Pressroom duo-tone
 * fills, used sparingly and never both in the same tile. Column spans come in
 * through `className` from the grid owner; `min-w-0` keeps long content from
 * pushing the track wider than its column.
 *
 * Widgets that already paint their own slab (terminal, heatmap, stats) are their
 * own tiles and don't use this wrapper - it exists for the content tiles, so no
 * card ever nests inside another card.
 */
export type TileTone = "paper" | "amber" | "slate";

const toneClasses: Record<TileTone, string> = {
  paper: "bg-surface",
  amber: "bg-accent text-accent-ink",
  slate: "bg-pine text-bg",
};

export type TileProps = ComponentPropsWithoutRef<"section"> & {
  tone?: TileTone;
};

export function Tile({ tone = "paper", className, ...props }: TileProps) {
  return (
    <section
      className={cn(
        "relative flex min-w-0 flex-col rounded-card border-2 border-ink p-6 shadow-widget sm:p-8",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

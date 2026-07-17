import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * A raised surface, Pressroom register: `surface` background, 2px ink border,
 * square corners and the hard-offset ink shadow (shadow-widget). The generic
 * container behind project cards, widgets and any panel that lifts off the page
 * background - the lift is the flat printed offset, never a soft blur.
 */
export type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-card border-2 border-ink bg-surface p-6 shadow-widget", className)}
      {...props}
    />
  );
}

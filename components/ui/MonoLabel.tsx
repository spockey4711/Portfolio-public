import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * Uppercase, letter-spaced mono micro-text (kickers, section labels, meta).
 * The "technical" voice of the design; see the type scale in the design system.
 */
export type MonoLabelTone = "pine" | "muted" | "ink";

const toneClasses: Record<MonoLabelTone, string> = {
  pine: "text-pine",
  muted: "text-muted",
  ink: "text-ink",
};

export type MonoLabelProps = ComponentPropsWithoutRef<"span"> & {
  tone?: MonoLabelTone;
};

export function MonoLabel({ tone = "pine", className, ...props }: MonoLabelProps) {
  return (
    <span
      className={cn("font-mono text-xs tracking-[1px] uppercase", toneClasses[tone], className)}
      {...props}
    />
  );
}

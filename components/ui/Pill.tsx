import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * A small mono chip, print register: `surface` background, ink border, square
 * corners. With `dot`, it leads with the pulsing amber status dot (e.g.
 * "Verfügbar für Werkstudent"). The pulse honours reduced motion.
 */
export type PillProps = ComponentPropsWithoutRef<"span"> & {
  dot?: boolean;
};

export function Pill({ dot = false, className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border-ink bg-surface text-ink-soft",
        "rounded-card border px-2.5 py-1 font-mono text-xs",
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-signal motion-safe:animate-glow-pulse"
        />
      ) : null}
      {children}
    </span>
  );
}

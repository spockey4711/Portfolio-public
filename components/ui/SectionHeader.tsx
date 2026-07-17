import { MonoLabel } from "@/components/ui/MonoLabel";
import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * The shared section kicker: a diamond ornament in the slate accent followed by
 * the mono title. Stacked directly above the section content in the same column -
 * never a numbered chapter eyebrow, never a two-column label/heading split. The
 * ornament is decorative (aria-hidden); the label is the visible text.
 */
export type SectionHeaderProps = ComponentPropsWithoutRef<"div"> & {
  title: string;
};

export function SectionHeader({ title, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <span aria-hidden className="text-sm leading-none text-pine">
        ◆
      </span>
      <MonoLabel tone="pine" className="tracking-[2px] whitespace-nowrap">
        {title}
      </MonoLabel>
    </div>
  );
}

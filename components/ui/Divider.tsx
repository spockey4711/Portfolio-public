import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * A 1px horizontal rule in the `line` token — the section separator
 * (`border-top: 1px solid var(--line)` in the handoff).
 */
export type DividerProps = ComponentPropsWithoutRef<"hr">;

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={cn("border-t border-line", className)} {...props} />;
}

import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * One horizontal band of the onepager. The page body is a vertical stack of
 * these (see Onepager.tsx): some bands carry open editorial prose straight on the
 * paper background, others carry a cluster of framed instrument tiles. Alternating
 * the two is what stops the landing reading as one wall-to-wall grid of boxes -
 * a box returns only where a widget earns its frame.
 *
 * Band owns the shared measure: it centres content at --container-max and applies
 * the page's horizontal padding, so every band lines up on the same left and right
 * edges regardless of what it holds. Vertical rhythm between bands is owned by the
 * stack in Onepager; a band opts into a hairline top rule via `className`
 * (border-t border-line) where an open section needs a quiet divider.
 */
export function Band({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-(--container-max) px-6 sm:px-10 lg:px-14", className)}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * The three button variants of the Pressroom design system, print-slab register:
 * - primary:   amber fill, 2px ink border, hard-offset ink shadow. Hover lifts the
 *              slab 1px against its shadow; active presses it flat (shadow gone,
 *              slab moved into its own offset - a physical press).
 * - secondary: transparent with a 2px ink border, same press behaviour, no fill.
 * - ghost:     slate text only, hover -> amber-bronze.
 *
 * One motion signal per element (the translate); colours switch instantly with it.
 * Renders an anchor when `href` is set (most CTAs are links: jump to a section,
 * download the CV, open GitHub) and a real `<button>` otherwise.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";

// `group` so a trailing `ArrowAffordance` can nudge on the button's hover and
// keyboard focus (see components/ui/ArrowAffordance.tsx); harmless for buttons
// that carry no arrow.
const base =
  "group inline-flex items-center gap-2 font-mono text-sm whitespace-nowrap transition-[transform,background-color,color,box-shadow] duration-150";

const slab =
  "border-2 border-ink shadow-widget px-5 py-3 uppercase tracking-[1px] text-[13px] " +
  "hover:-translate-x-px hover:-translate-y-px " +
  "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(slab, "bg-accent text-accent-ink"),
  secondary: cn(slab, "bg-surface text-ink"),
  ghost: "text-pine hover:text-signal",
};

type ButtonBaseProps = {
  variant?: ButtonVariant;
};

type ButtonAsButton = ButtonBaseProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps & ComponentPropsWithoutRef<"a"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const classes = cn(base, variantClasses[variant], className);

  // `href` discriminates the union: present → anchor, absent → real button.
  if (rest.href !== undefined) {
    return <a className={classes} {...rest} />;
  }

  return <button className={classes} {...rest} />;
}

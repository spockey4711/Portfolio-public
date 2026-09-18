import { cn } from "@/lib/utils/cn";

import type { ComponentPropsWithoutRef } from "react";

/**
 * Uppercase, letter-spaced mono micro-text (kickers, section labels, meta).
 * The "technical" voice of the design; see the type scale in the design system.
 */
export type MonoLabelTone = "pine" | "muted" | "ink";

/**
 * Whether the label uppercases its text. Most labels do - that is the register.
 * `normal` is for the cases where the text carries its own casing and losing it
 * would be wrong: prose-shaped meta ("seit Oktober 2024") and names that are
 * spelled a particular way ("iOS-App", "macOS-App").
 *
 * This is a prop rather than a `normal-case` className because `cn` is a plain
 * join, not a class merger: passing both `uppercase` and `normal-case` leaves the
 * winner to the order Tailwind happens to emit them in, and `uppercase` wins.
 */
export type MonoLabelCase = "upper" | "normal";

const toneClasses: Record<MonoLabelTone, string> = {
  pine: "text-pine",
  muted: "text-muted",
  ink: "text-ink",
};

const caseClasses: Record<MonoLabelCase, string> = {
  upper: "uppercase",
  normal: "normal-case",
};

export type MonoLabelProps = ComponentPropsWithoutRef<"span"> & {
  tone?: MonoLabelTone;
  textCase?: MonoLabelCase;
};

export function MonoLabel({
  tone = "pine",
  textCase = "upper",
  className,
  ...props
}: MonoLabelProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs tracking-[1px]",
        caseClasses[textCase],
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

/**
 * Join class names, dropping falsy values so conditional classes stay terse:
 * `cn("base", isActive && "active", className)`. Intentionally tiny — the
 * primitives compose a fixed set of Tailwind utilities with no conflicting
 * overrides, so full class-merging (tailwind-merge) is not warranted yet.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

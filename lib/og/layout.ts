/**
 * Pure layout helpers for the social card template (@/lib/og/card). Kept free of
 * `next/og` and any I/O so the sizing and truncation logic - the parts that can
 * silently break the card - stay unit testable on their own. See card.tsx.
 */

/**
 * Pick a display size (px) for the card title so short project names read large
 * and long post titles still fit within the frame. Satori has no text auto-fit,
 * so the size steps down as the character count grows.
 */
export function titleFontSize(title: string): number {
  const n = title.trim().length;
  if (n <= 18) return 118;
  if (n <= 30) return 92;
  if (n <= 46) return 72;
  return 58;
}

/**
 * Trim overly long copy to a single tidy card line, appending an ellipsis when it
 * had to cut. Whitespace is trimmed first so the length test and the cut both work
 * on the visible text.
 */
export function clampText(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

"use client";

import NextLink from "next/link";
import { useCallback } from "react";

import { hrefToString, shouldAnimateViewTransition } from "@/lib/motion/view-transitions";

import { useViewTransitionRouter } from "./ViewTransitionProvider";

import type { ComponentProps } from "react";

type NextLinkProps = ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for `next/link` that animates same-app route changes with
 * the View Transitions API (S2-7). It wraps `next/link` rather than reimplementing
 * it, so prefetch and all the click semantics (modified clicks, new-tab, external
 * targets, downloads) still come from Next: `onNavigate` fires only for genuine
 * client-side navigations, which are exactly the ones we want to animate.
 *
 * When the API is unavailable or the visitor prefers reduced motion we do not
 * `preventDefault`, so `next/link` performs its ordinary navigation - the plain
 * fallback the acceptance criteria require.
 */
export function Link({ onNavigate, ...props }: NextLinkProps) {
  const router = useViewTransitionRouter();

  const handleNavigate = useCallback<NonNullable<NextLinkProps["onNavigate"]>>(
    (event) => {
      // The onNavigate event only exposes preventDefault (no defaultPrevented),
      // so wrap it to learn whether a caller-supplied handler cancelled the
      // navigation; if it did, we stay out of the way entirely.
      let cancelled = false;
      onNavigate?.({
        preventDefault: () => {
          cancelled = true;
          event.preventDefault();
        },
      });
      if (cancelled) return;
      // Let next/link navigate normally where we would not animate anyway. This
      // is also the fallback for unsupported browsers and reduced motion.
      if (!shouldAnimateViewTransition()) return;

      event.preventDefault();
      const href = hrefToString(props.href);
      const navigate = props.replace ? router.replace : router.push;
      navigate(href, { scroll: props.scroll });
    },
    [onNavigate, props.href, props.replace, props.scroll, router],
  );

  return <NextLink {...props} onNavigate={handleNavigate} />;
}

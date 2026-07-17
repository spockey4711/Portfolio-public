"use client";

// Read the App Router straight from its context, the way next/link does
// (link.js -> AppRouterContext), rather than via useRouter(). useRouter() throws
// when the router is not mounted; reading the context returns null instead, so a
// <Link> rendered in isolation (unit tests) degrades gracefully exactly like
// next/link, and we keep the same tolerance in production.
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createContext, startTransition, useCallback, useContext, useEffect, useRef } from "react";

import { shouldAnimateViewTransition } from "@/lib/motion/view-transitions";

import type { ReactNode, RefObject } from "react";

/**
 * Route view transitions for the App Router (S2-7).
 *
 * Stable React has no `<ViewTransition>` component yet (it lives in the
 * experimental channel, which we do not ship), so we drive the browser's native
 * `document.startViewTransition` around client navigations ourselves. The tricky
 * part is timing: `router.push` returns immediately but the new route commits
 * later, so we hand `startViewTransition` a promise and resolve it only once the
 * new route has painted. This provider owns that resolver: it stashes it in a ref
 * and fires it from an effect that runs after every commit that follows a wrapped
 * navigation. A safety timeout guarantees the transition can never wedge input if
 * a navigation somehow never re-renders (acceptance: "no blocked interaction").
 *
 * See docs/design/animation-and-motion.md and docs/project/backlog.md (S2-7).
 */

// Upper bound on how long a single transition may hold the page before we resolve
// it regardless. The cross-fade itself is far shorter (see globals.css); this only
// exists so a navigation that never commits cannot freeze interaction.
const MAX_TRANSITION_MS = 800;

type FinishFn = () => void;

const FinishContext = createContext<RefObject<FinishFn | null> | null>(null);

export function ViewTransitionProvider({ children }: { children: ReactNode }) {
  const finishRef = useRef<FinishFn | null>(null);

  // Runs after every render. Once a wrapped navigation is in flight, the next
  // commit is the new route painting, so we resolve the pending transition here.
  // A no-op on ordinary renders because the ref is null unless a nav set it.
  useEffect(() => {
    const finish = finishRef.current;
    if (finish) {
      finishRef.current = null;
      finish();
    }
  });

  return <FinishContext.Provider value={finishRef}>{children}</FinishContext.Provider>;
}

function useFinishRef(): RefObject<FinishFn | null> | null {
  return useContext(FinishContext);
}

type NavOptions = { scroll?: boolean };
type NavMethod = "push" | "replace";

/**
 * A thin wrapper over the App Router that animates the navigation with the View
 * Transitions API when supported and motion is welcome, and otherwise navigates
 * plainly. `push`/`replace` mirror `useRouter`'s signatures for the string href
 * form we need.
 */
export function useViewTransitionRouter() {
  const router = useContext(AppRouterContext);
  const finishRef = useFinishRef();

  const navigate = useCallback(
    (method: NavMethod, href: string, options?: NavOptions) => {
      // No router mounted (e.g. isolated render): nothing to navigate.
      if (!router) return;

      // Plain navigation when we would not animate, or when the provider is
      // absent so we cannot resolve the transition on the new route's commit.
      if (!finishRef || !shouldAnimateViewTransition()) {
        router[method](href, options);
        return;
      }

      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            let done = false;
            const finish = () => {
              if (done) return;
              done = true;
              window.clearTimeout(timer);
              if (finishRef.current === finish) finishRef.current = null;
              resolve();
            };
            // Resolve when the new route commits (provider effect) or, failing
            // that, after the safety window so input is never blocked.
            const timer = window.setTimeout(finish, MAX_TRANSITION_MS);
            finishRef.current = finish;
            // Mark the navigation as a transition so React can keep the old UI
            // interactive while the new route streams in.
            startTransition(() => router[method](href, options));
          }),
      );
    },
    [router, finishRef],
  );

  const push = useCallback(
    (href: string, options?: NavOptions) => navigate("push", href, options),
    [navigate],
  );
  const replace = useCallback(
    (href: string, options?: NavOptions) => navigate("replace", href, options),
    [navigate],
  );

  return { push, replace };
}

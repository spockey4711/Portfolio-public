"use client";

import { RouteError, type RouteErrorProps } from "@/components/error/RouteError";

/**
 * German route error boundary. Catches runtime errors thrown while rendering the
 * German (canonical) segment tree and, wrapped by the (de) layout's chrome, shows
 * the shared terminal error surface and reports the error to GlitchTip (S6-2). Its
 * English twin is app/(en)/error.tsx; only the locale differs.
 */
export default function DeError(props: Omit<RouteErrorProps, "locale">) {
  return <RouteError {...props} locale="de" />;
}

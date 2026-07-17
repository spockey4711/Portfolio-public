"use client";

import { RouteError, type RouteErrorProps } from "@/components/error/RouteError";

/**
 * English route error boundary. Catches runtime errors thrown while rendering the
 * `/en` segment tree and, wrapped by the (en) layout's chrome, shows the shared
 * terminal error surface and reports the error to GlitchTip (S6-2). Its German twin
 * is app/(de)/error.tsx; only the locale differs.
 */
export default function EnError(props: Omit<RouteErrorProps, "locale">) {
  return <RouteError {...props} locale="en" />;
}

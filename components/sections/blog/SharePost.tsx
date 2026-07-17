"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";

/**
 * Post share affordances (S5-4): a native Web Share button and a copy-link
 * button, both cookieless and free of third-party scripts. The native button is
 * progressive enhancement - it only appears where the browser exposes
 * navigator.share, resolved after mount to avoid a hydration mismatch. The copy
 * button is the universal fallback and confirms with a short-lived status.
 *
 * Labels arrive as a prop rather than being read from the copy registry so the
 * component stays locale-agnostic and unit testable; the page passes the localized
 * strings and the absolute URL to share.
 */

export interface SharePostLabels {
  /** Group heading, e.g. "Diesen Beitrag teilen". */
  heading: string;
  /** Native share button label. */
  native: string;
  /** Copy-link button label (idle). */
  copy: string;
  /** Copy-link confirmation, shown briefly after a successful copy. */
  copied: string;
}

const COPIED_RESET_MS = 2000;

const buttonClass =
  "inline-flex items-center gap-2 rounded-pill border border-line px-3.5 py-2 font-mono text-xs tracking-[0.5px] text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-signal";

// Web Share support is a stable browser capability, so it never changes for the
// lifetime of the page: subscribe is a no-op. The server snapshot is false so the
// button is absent in the SSR HTML and only appears after hydration where the API
// exists - hydration-safe without a setState-in-effect.
const noop = () => () => {};
const hasWebShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";
const serverHasWebShare = () => false;

export function SharePost({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: SharePostLabels;
}) {
  const headingId = useId();
  const canNativeShare = useSyncExternalStore(noop, hasWebShare, serverHasWebShare);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // The user dismissed the share sheet, or the browser rejected the call -
      // nothing to recover; the copy button remains available.
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard unavailable (insecure context, denied permission) - fail quietly;
      // the URL is still in the address bar for a manual copy.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p id={headingId} className="font-mono text-xs tracking-[1px] text-muted uppercase">
        {labels.heading}
      </p>
      <div role="group" aria-labelledby={headingId} className="flex flex-wrap items-center gap-3">
        {canNativeShare ? (
          <button type="button" onClick={handleNativeShare} className={buttonClass}>
            {labels.native}
          </button>
        ) : null}
        <button type="button" onClick={handleCopy} className={buttonClass}>
          <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
        </button>
      </div>
    </div>
  );
}

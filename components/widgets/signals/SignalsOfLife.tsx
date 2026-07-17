"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type { LatestCommitResult } from "@/lib/data/latest-commit";
import { type Locale, localeTag } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/relative-time";

/**
 * The signals-of-life feed (S3-5): one "the site is alive" surface that gathers the
 * otherwise scattered live signals into a single strip - the latest public commit,
 * the latest blog post and the GitHub contribution total. Like the terminal and the
 * activity heatmap it is a widget, not a numbered section, so it stays out of the
 * section-eyebrow sequence. The now-playing track is deliberately NOT mirrored here:
 * on the onepager this feed sits beside the dedicated now-playing tile, so a second
 * copy would just duplicate the same line.
 *
 * The latest post is real content known at build time, so it is passed in as a prop
 * and rendered on the server; the two live signals (commit + contributions) are
 * fetched from their same-origin routes after hydration, each independently. Every
 * row starts from its static fallback, so the server render and the first client
 * render agree (no hydration mismatch) and the surface reserves its height up front
 * (no CLS). Each source fails on its own: one route erroring leaves its row on the
 * fallback and never touches the others (per-source graceful degradation).
 *
 * The only motion is the live-dot pulse, gated behind `motion-safe`; nothing
 * re-renders per frame (the commit and contribution reads fire once). See
 * docs/architecture/rendering-and-data.md.
 */

/** The build-time latest-post signal, pre-shaped by the server parent. */
export type SignalsPost = {
  title: string;
  href: string;
  /** Localised display date, e.g. "6. Juli 2026". */
  dateLabel: string;
  /** ISO `YYYY-MM-DD`, for the machine-readable <time dateTime>. */
  dateIso: string;
};

type SignalRowProps = {
  kicker: string;
  primary: string;
  meta?: ReactNode;
  /** An internal (Next) or external link the whole row navigates to, if any. */
  link?: { href: string; external: boolean };
};

/**
 * One fixed-height feed row: a mono kicker, a primary line and an optional muted
 * meta line. The row height is reserved for two lines regardless of how many the
 * current state fills, so a fallback row and a resolved row are the same size and
 * nothing shifts when live data arrives.
 */
function SignalRow({ kicker, primary, meta, link }: SignalRowProps) {
  const body = (
    <>
      <MonoLabel
        tone="pine"
        className="w-20 shrink-0 pt-0.5 text-[10px] tracking-[1.5px] normal-case"
      >
        {kicker}
      </MonoLabel>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm text-ink-soft">{primary}</span>
        {meta ? (
          <span className="truncate font-mono text-xs text-muted tabular-nums">{meta}</span>
        ) : null}
      </span>
    </>
  );

  const rowClass = "flex min-h-[3.25rem] items-center gap-3 border-t border-line/60 py-3";

  if (link?.external) {
    return (
      <li>
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(rowClass, "group transition-colors hover:text-signal")}
        >
          {body}
        </a>
      </li>
    );
  }

  if (link) {
    return (
      <li>
        <Link
          href={link.href}
          className={cn(rowClass, "group transition-colors hover:text-signal")}
        >
          {body}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className={rowClass}>{body}</div>
    </li>
  );
}

export function SignalsOfLife({
  locale,
  latestPost,
}: {
  locale: Locale;
  latestPost: SignalsPost | null;
}) {
  const copy = getCopy(locale).signals;

  const [commit, setCommit] = useState<LatestCommitResult>({ available: false });
  const [contributions, setContributions] = useState<number | null>(null);

  // Latest commit: fetched once after hydration; keeps the fallback on any failure.
  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/latest-commit", { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<LatestCommitResult>) : null))
      .then((result) => {
        if (result?.available) {
          setCommit(result);
        }
      })
      .catch(() => {
        // Ignore: network or abort errors leave the fallback row in place.
      });

    return () => controller.abort();
  }, []);

  // GitHub contribution total: reuses the heatmap's route and reads only the total.
  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/github-activity", { signal: controller.signal })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<{ available: boolean; totalContributions?: number }>)
          : null,
      )
      .then((result) => {
        if (result?.available && typeof result.totalContributions === "number") {
          setContributions(result.totalContributions);
        }
      })
      .catch(() => {
        // Ignore: leaves the contribution row on its fallback.
      });

    return () => controller.abort();
  }, []);

  const contributionsPrimary =
    contributions !== null
      ? `${contributions.toLocaleString(localeTag[locale])} ${copy.github.summary}`
      : copy.github.fallback;

  return (
    <section aria-label={copy.regionLabel} className="flex h-full min-w-0 flex-col">
      <div className="flex flex-1 flex-col rounded-card border-2 border-ink bg-surface p-5 shadow-widget sm:p-6">
        {/* A plain div, not a <header>: a second <header> tag on the page would
            collide with the site banner in tag-based test/landmark queries, and
            this heading group is not a banner. */}
        <div className="mb-4 flex flex-col gap-2">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-signal motion-safe:animate-pulse"
            />
            <MonoLabel tone="pine">{copy.label}</MonoLabel>
          </span>
          <h2 className="font-display text-xl leading-tight tracking-[-0.01em] text-ink sm:text-2xl">
            {copy.title}
          </h2>
          <p className="max-w-[52ch] text-sm text-muted">{copy.intro}</p>
        </div>

        <ul className="flex flex-col">
          {commit.available ? (
            <SignalRow
              kicker={copy.kickers.commit}
              primary={commit.message}
              meta={`${formatRelativeTime(commit.committedAt, locale)} · ${commit.repo}`}
              link={{ href: commit.url, external: true }}
            />
          ) : (
            <SignalRow kicker={copy.kickers.commit} primary={copy.commit.fallback} />
          )}

          {latestPost ? (
            <SignalRow
              kicker={copy.kickers.post}
              primary={latestPost.title}
              meta={<time dateTime={latestPost.dateIso}>{latestPost.dateLabel}</time>}
              link={{ href: latestPost.href, external: false }}
            />
          ) : (
            <SignalRow kicker={copy.kickers.post} primary={copy.post.fallback} />
          )}

          {contributions !== null ? (
            <SignalRow
              kicker={copy.kickers.github}
              primary={contributionsPrimary}
              link={{ href: copy.github.link.href, external: true }}
            />
          ) : (
            <SignalRow kicker={copy.kickers.github} primary={contributionsPrimary} />
          )}
        </ul>
      </div>
    </section>
  );
}

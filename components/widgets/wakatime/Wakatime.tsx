"use client";

import { useEffect, useState } from "react";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type { WakatimeProject, WakatimeResult } from "@/lib/data/wakatime";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The WakaTime coding-stats strip (S3-2): a standalone last-7-days project
 * breakdown mounted right after the GitHub activity heatmap (app/page.tsx), so the
 * two live-coding signals sit together. Like the heatmap, it is a widget rather than
 * a numbered section, so it stays out of the section-eyebrow sequence.
 *
 * The stats are fetched from the same-origin /api/wakatime route, which reads a
 * server-only WakaTime key; the client never sees the key and calls only that
 * endpoint. The widget renders a fixed number of rows (a skeleton on the server and
 * the first client render, so the two agree and the strip reserves its height up
 * front - no hydration mismatch, no layout shift). The live breakdown is fetched in
 * an effect after hydration; if it fails or never arrives, the skeleton and the
 * static fallback caption simply stay.
 *
 * The bars are coloured with the site's own tokens (line/signal), so the widget
 * stays on-brand and visually pairs with the heatmap. There is no animation, so
 * nothing to gate on reduced motion; each project row exposes its name and duration
 * as text, and the bar is decorative.
 */

// The breakdown always renders this many rows (matching TOP_PROJECTS in
// lib/data/wakatime.ts). Filling missing rows with placeholders keeps the strip's
// height fixed whether it is loading, empty or full - so it never shifts layout.
const DISPLAY_ROWS = 5;
const ROW_INDEXES = Array.from({ length: DISPLAY_ROWS }, (_, index) => index);

export function Wakatime({ locale }: { locale: Locale }) {
  const wk = getCopy(locale).wakatime;
  const [stats, setStats] = useState<WakatimeResult>({ available: false });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/wakatime", { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<WakatimeResult>) : null))
      .then((result) => {
        if (result?.available) {
          setStats(result);
        }
      })
      .catch(() => {
        // Ignore: network or abort errors leave the static fallback in place.
      });

    return () => controller.abort();
  }, []);

  const projects = stats.available ? stats.projects : [];
  const caption = !stats.available
    ? wk.fallback
    : projects.length === 0
      ? wk.emptyProjects
      : `${stats.humanReadableTotal} ${wk.summary}`;

  return (
    <section aria-label={wk.regionLabel} className="flex h-full min-w-0 flex-col">
      <div className="flex flex-1 flex-col rounded-card border-2 border-ink bg-surface p-5 shadow-widget sm:p-6">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <MonoLabel tone="pine">{wk.label}</MonoLabel>
          <span className="font-mono text-xs text-muted tabular-nums">{caption}</span>
        </div>

        <ul role="list" className="flex flex-col gap-4">
          {ROW_INDEXES.map((index) => (
            <ProjectRow key={index} project={projects[index]} />
          ))}
        </ul>

        <div className="mt-6">
          <a
            href={wk.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-pine transition-colors hover:text-signal"
          >
            {wk.link.label} <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * One breakdown row. With a project it shows the name, its duration and a bar sized
 * to its share; without one (loading, or fewer than DISPLAY_ROWS projects) it renders
 * an empty placeholder of the same height, so the strip keeps a fixed layout.
 */
function ProjectRow({ project }: { project: WakatimeProject | undefined }) {
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-x-4 font-mono text-xs">
        <span className={cn(project ? "text-ink" : "text-muted/40")}>
          {project ? project.name : "—"}
        </span>
        {project ? <span className="text-muted tabular-nums">{project.text}</span> : null}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
        {project ? (
          <div
            aria-hidden
            className="h-full rounded-full bg-signal"
            style={{ width: `${project.percent}%` }}
          />
        ) : null}
      </div>
    </li>
  );
}

"use client";

import { useEffect, useState } from "react";

import { type Copy } from "@/content/copy";
import type { WeatherResult } from "@/lib/data/weather";
import { formatBerlinTime } from "@/lib/utils/berlin-time";

type HeroMetaCopy = Copy["hero"]["status"]["meta"];

/**
 * The hero's mono meta line - "GER · 14:32 CEST · 18°C". The location is fixed;
 * the time and temperature are live (P2-2).
 *
 * Both live values start from the static fallback in the content model, so the
 * server render and the first client render agree (no hydration mismatch) and the
 * line reserves its width up front (no layout shift). The clock and the
 * same-origin /api/weather fetch update only after hydration, in effects; either
 * can fail or never arrive and the fallback simply stays. `tabular-nums` keeps the
 * digits a fixed width so the ticking clock does not jitter the line.
 *
 * There is no animation here, so nothing to gate on reduced motion; the updates
 * are silent to assistive tech (no aria-live) rather than announcing every minute.
 */
export function HeroMeta({ meta }: { meta: HeroMetaCopy }) {
  const [time, setTime] = useState<string>(meta.time);
  const [temperature, setTemperature] = useState<string>(meta.temperature);

  // Live clock in Europe/Berlin, refreshed each minute.
  useEffect(() => {
    const tick = () => setTime(formatBerlinTime(new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Live temperature from the same-origin route; keeps the fallback on any failure.
  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/weather", { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<WeatherResult>) : null))
      .then((result) => {
        if (result?.available) {
          setTemperature(`${result.temperatureC}°C`);
        }
      })
      .catch(() => {
        // Ignore: network or abort errors leave the static fallback in place.
      });

    return () => controller.abort();
  }, []);

  return (
    <span className="font-mono text-xs text-muted tabular-nums">
      {meta.location} · {time} · {temperature}
    </span>
  );
}

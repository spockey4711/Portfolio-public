/**
 * Server-only weather source for the hero meta widget (P2-2).
 *
 * Uses Open-Meteo, which needs no API key, for the fixed Cologne location - the
 * coordinates are baked in and the site never derives the visitor's location.
 * The result is intentionally tiny: the widget only shows a rounded temperature.
 *
 * This module must stay server-only. It is consumed by the /api/weather route
 * handler (app/api/weather/route.ts); the client widget calls that same-origin
 * endpoint, never Open-Meteo directly. See docs/architecture/rendering-and-data.md.
 */

// Fixed Cologne coordinates. Not derived from the visitor.
const COLOGNE = { latitude: 50.9375, longitude: 6.9603 } as const;

// Keep upstream calls infrequent: Next caches the fetch for ~30 min, matching the
// weather cache budget in docs/architecture/rendering-and-data.md.
const REVALIDATE_SECONDS = 1800;

/** The shape the /api/weather route returns to the client widget. */
export type WeatherResult = { available: true; temperatureC: number } | { available: false };

type OpenMeteoResponse = { current?: { temperature_2m?: unknown } };

/**
 * Fetches the current temperature for Cologne, rounded to a whole degree. Throws
 * on a network error, a non-OK response or an unexpected payload so the caller can
 * decide how to degrade; it never returns a bogus value.
 */
export async function fetchCurrentTemperature(): Promise<number> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(COLOGNE.latitude));
  url.searchParams.set("longitude", String(COLOGNE.longitude));
  url.searchParams.set("current", "temperature_2m");

  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) {
    throw new Error(`Open-Meteo responded ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const temperature = data.current?.temperature_2m;
  if (typeof temperature !== "number" || !Number.isFinite(temperature)) {
    throw new Error("Open-Meteo payload is missing a numeric temperature_2m");
  }

  return Math.round(temperature);
}

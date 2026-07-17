/**
 * The branded dynamic social card, rendered server-side with `next/og` (Satori).
 * One template drives every per-project and per-post Open Graph / Twitter image
 * (S5-3), so the individual route files stay thin - they only map their entity to
 * the shared `card` props. It deliberately mirrors the committed default share
 * image (scripts/generate-assets.mjs -> public/og/default.png): the same 1200x630
 * frame, Sand & Pine palette, left spine and mono/serif type, so a generated card
 * and the default read as one family. See docs/content/seo.md.
 *
 * Satori is not a full browser: layout is flexbox-only and effects like the
 * default template's masked diagonal texture are unavailable, so the card leans on
 * the spine and type alone. Fonts must be supplied as raw buffers (no CSS @font-
 * face), so the three typefaces are committed as TTFs under ./fonts and read once
 * at build time - these routes are statically generated, so the reads never run on
 * a request.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { clampText, titleFontSize } from "@/lib/og/layout";

import type { ReactElement } from "react";

/** The Open Graph / Twitter `summary_large_image` canvas (matches the default). */
export const CARD_SIZE = { width: 1200, height: 630 } as const;

/** Emitted content type; PNG matches the committed default share image. */
export const CARD_CONTENT_TYPE = "image/png";

// Palette mirrored from app/globals.css (:root) via scripts/generate-assets.mjs;
// keep in sync if the design tokens change.
const color = {
  bg: "#eae6d9",
  ink: "#1c211c",
  inkSoft: "#57534a",
  muted: "#646659",
  line: "#d8d3c3",
  pine: "#24543f",
  signal: "#157a45",
} as const;

const fontFamily = {
  serif: "Instrument Serif",
  sans: "Hanken Grotesk",
  mono: "IBM Plex Mono",
} as const;

// The committed TTFs. Weights match the styles the template actually uses, so
// Satori never has to synthesise a face. Loaded once and cached across renders.
const fontFiles = [
  { file: "InstrumentSerif-Regular.ttf", name: fontFamily.serif, weight: 400 },
  { file: "HankenGrotesk-Regular.ttf", name: fontFamily.sans, weight: 400 },
  { file: "HankenGrotesk-SemiBold.ttf", name: fontFamily.sans, weight: 600 },
  { file: "IBMPlexMono-Medium.ttf", name: fontFamily.mono, weight: 500 },
] as const;

type CardFont = { name: string; data: Buffer; weight: 400 | 600 | 500; style: "normal" };

let cachedFonts: CardFont[] | undefined;

function loadFonts(): CardFont[] {
  if (!cachedFonts) {
    const dir = join(process.cwd(), "lib", "og", "fonts");
    cachedFonts = fontFiles.map(({ file, name, weight }) => ({
      name,
      data: readFileSync(join(dir, file)),
      weight,
      style: "normal",
    }));
  }
  return cachedFonts;
}

export interface CardProps {
  /** Small uppercase mono label above the title (e.g. "Projekt", "Artikel"). */
  kicker: string;
  /** The headline: a project name or a post title. */
  title: string;
  /** One-line supporting copy: a tagline or post summary. */
  subtitle: string;
  /** Left footer slug, e.g. the domain. Defaults to the site domain. */
  footerLeft?: string;
  /** Right footer slug, e.g. a location, date or reading time. */
  footerRight?: string;
  /** Optional pill in the top row (e.g. a project status label). */
  badge?: string;
}

/** The card as a Satori element tree. Split out so it stays unit-inspectable. */
function CardTree({
  kicker,
  title,
  subtitle,
  footerLeft = "yannikwuenker.de",
  footerRight,
  badge,
}: CardProps): ReactElement {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: color.bg,
        fontFamily: fontFamily.sans,
      }}
    >
      {/* Left spine - the default template's anchoring vertical rule. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 96,
          width: 2,
          background: color.pine,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 96px 68px 140px",
        }}
      >
        {/* Kicker row: the section label, and an optional status pill. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: fontFamily.mono,
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: color.signal,
            }}
          >
            {kicker}
          </div>
          {badge ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: fontFamily.mono,
                fontWeight: 500,
                fontSize: 18,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: color.pine,
                border: `1px solid ${color.line}`,
                borderRadius: 999,
                padding: "8px 18px",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 999, background: color.pine }} />
              {badge}
            </div>
          ) : null}
        </div>

        {/* Headline block. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: fontFamily.serif,
              fontSize: titleFontSize(title),
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: color.ink,
            }}
          >
            {clampText(title, 70)}
          </div>
          <div
            style={{
              fontSize: 33,
              lineHeight: 1.35,
              color: color.inkSoft,
              maxWidth: 780,
              marginTop: 26,
            }}
          >
            {clampText(subtitle, 150)}
          </div>
        </div>

        {/* Footer row. The separator is a mono middle-dot rather than a drawn
            circle so it sits on the text baseline (Satori mis-centres tiny
            boxes against text); pine picks it out as a small brand accent. */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            fontFamily: fontFamily.mono,
            fontWeight: 500,
            fontSize: 20,
            color: color.muted,
          }}
        >
          <div style={{ display: "flex" }}>{footerLeft}</div>
          {footerRight ? (
            <>
              <div style={{ display: "flex", color: color.pine }}>·</div>
              <div style={{ display: "flex" }}>{footerRight}</div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Render a branded social card to an `ImageResponse` (PNG, 1200x630). */
export function renderCard(props: CardProps): ImageResponse {
  return new ImageResponse(<CardTree {...props} />, {
    ...CARD_SIZE,
    fonts: loadFonts().map(({ name, data, weight, style }) => ({ name, data, weight, style })),
  });
}

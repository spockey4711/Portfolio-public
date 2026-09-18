/**
 * Generates the site's brand imagery from a committed HTML template so the asset
 * stays reproducible instead of being a hand-painted one-off: the default Open
 * Graph share image (public/og/default.png).
 *
 * It can also re-shoot the live product screenshots (Aurelian, fuelivo) at a
 * consistent viewport. Rendering goes through Playwright's bundled Chromium (a
 * devDependency already used by the e2e suite), so no extra tooling or font
 * embedding is needed - the template loads the site's Google fonts directly.
 *
 * It no longer generates on-brand cover placeholders. The projects index is a
 * typographic list rather than a card grid, so a project without a real product
 * shot needs no image at all - and a generated cover proved nothing about a
 * product it never showed (ADR-0011).
 *
 * Usage:
 *   node scripts/generate-assets.mjs            # og image -> public/
 *   node scripts/generate-assets.mjs reshoot    # + live screenshots -> preview dir
 *
 * The palette and typefaces mirror app/globals.css and app/fonts.ts; keep them in
 * sync if the design tokens change. See docs/content/projects.md and
 * docs/content/seo.md.
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const publicDir = join(root, "public");
const previewDir = join(root, ".asset-preview");

// Design tokens mirrored from app/globals.css (:root, light theme). These are the
// "Pressroom" values: warm slate-cream paper, ink-black text, a slate-blue calm
// accent (--pine) and an amber-gold heat accent (--signal fill / --accent). Kept as
// raw oklch() strings so they stay identical to the CSS source of truth - Playwright's
// bundled Chromium renders oklch() natively.
const c = {
  bg: "oklch(89% 0.025 65)",
  surface: "oklch(92.5% 0.02 68)",
  ink: "oklch(16% 0.02 60)",
  inkSoft: "oklch(32% 0.02 58)",
  muted: "oklch(44% 0.025 55)",
  line: "oklch(76% 0.03 62)",
  lineStrong: "oklch(58% 0.035 58)",
  // The Pressroom duo: slate carries rules/calm accents, amber carries the heat.
  pine: "oklch(34% 0.1 240)",
  signal: "oklch(50% 0.12 68)",
  signalInk: "oklch(47% 0.115 68)",
  moss: "oklch(45% 0.05 240)",
  accent: "oklch(78% 0.18 80)",
  accentInk: "oklch(16% 0.02 60)",
  shadowInk: "oklch(16% 0.02 60)",
};

const FONT_LINK = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
`;

// The Pressroom pairing (app/fonts.ts): a heavy condensed display over an
// engineering sans, with the mono as the single outlier register for labels.
const FONTS = {
  display: `'Big Shoulders', ui-sans-serif, 'Arial Narrow', sans-serif`,
  sans: `'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif`,
  mono: `'IBM Plex Mono', ui-monospace, 'SFMono-Regular', monospace`,
};

/** A faint diagonal hairline field, the same motif as the ProjectMedia placeholder. */
const diagonalField = `repeating-linear-gradient(-45deg, ${c.line} 0, ${c.line} 1px, transparent 1px, transparent 11px)`;

/** The default Open Graph share image: editorial, name-forward, on the Pressroom palette. */
function ogTemplate() {
  return `<!doctype html><html><head><meta charset="utf-8" />${FONT_LINK}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; background: ${c.bg}; font-family: ${FONTS.sans};
           position: relative; overflow: hidden; }
    .spine { position: absolute; top: 0; bottom: 0; left: 96px; width: 2px; background: ${c.pine}; opacity: 0.9; }
    .texture { position: absolute; inset: 0; background: ${diagonalField}; opacity: 0.4;
               -webkit-mask-image: linear-gradient(135deg, transparent 55%, black 100%);
               mask-image: linear-gradient(135deg, transparent 55%, black 100%); }
    .frame { position: absolute; inset: 0; padding: 76px 96px 72px 140px;
             display: flex; flex-direction: column; justify-content: space-between; }
    .head { display: flex; align-items: center; gap: 22px; }
    /* The Pressroom "mark": an amber-gold fill on a hard-offset ink shadow (never blurred). */
    .mark { width: 34px; height: 34px; background: ${c.accent}; box-shadow: 4px 4px 0 0 ${c.shadowInk}; }
    .kicker { font-family: ${FONTS.mono}; font-size: 20px; letter-spacing: 0.22em;
              text-transform: uppercase; color: ${c.pine}; }
    .name { font-family: ${FONTS.display}; font-weight: 800; font-size: 150px; line-height: 1.0;
            text-transform: uppercase; color: ${c.ink}; letter-spacing: 0.01em; }
    .tagline { font-size: 34px; line-height: 1.35; color: ${c.inkSoft}; max-width: 760px; margin-top: 26px; }
    .foot { display: flex; align-items: center; gap: 18px; font-family: ${FONTS.mono};
            font-size: 19px; color: ${c.muted}; }
    .dot { width: 7px; height: 7px; border-radius: 999px; background: ${c.pine}; }
  </style></head>
  <body>
    <div class="spine"></div>
    <div class="texture"></div>
    <div class="frame">
      <div class="head"><span class="mark"></span><span class="kicker">Portfolio</span></div>
      <div>
        <div class="name">Yannik Wünker</div>
        <div class="tagline">Wirtschaftsinformatik, digitale Produkte und Webentwicklung.</div>
      </div>
      <div class="foot"><span>yannikwuenker.de</span><span class="dot"></span><span>Köln</span></div>
    </div>
  </body></html>`;
}

// Live product shots re-captured at a consistent viewport. Written to the preview
// dir first so a regression against the curated originals can be caught by eye
// before anything in public/ is overwritten. Aurelian and fuelivo lead with real
// screenshots; `dismiss` names a button (e.g. a cookie banner's decline) that is
// clicked before the shot so no overlay ends up in the capture.
const reshoots = [
  {
    name: "aurelian_screen",
    url: "https://aurelian.yannikwuenker.de",
    viewport: { width: 430, height: 932 },
  },
  {
    // 1200x760 at deviceScaleFactor 2 gives a 2400x1520 raster, so the featured
    // card's 16/10 box crops nothing meaningful.
    name: "fuelivo_cover",
    url: "https://fuelivo.de",
    viewport: { width: 1200, height: 760 },
    dismiss: "Alle ablehnen",
  },
];

async function renderTemplate(page, html, { width, height }, outPath) {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.screenshot({ path: outPath });
  console.log(`  wrote ${outPath}`);
}

async function main() {
  const doReshoot = process.argv.includes("reshoot");
  await mkdir(join(publicDir, "og"), { recursive: true });
  await mkdir(join(publicDir, "images"), { recursive: true });

  const browser = await chromium.launch();
  // deviceScaleFactor 2 -> crisp @2x raster for the retina card and share preview.
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  console.log("OG image:");
  await renderTemplate(
    page,
    ogTemplate(),
    { width: 1200, height: 630 },
    join(publicDir, "og/default.png"),
  );

  if (doReshoot) {
    await mkdir(previewDir, { recursive: true });
    console.log("Live re-shoots (preview only):");
    for (const shot of reshoots) {
      await page.setViewportSize(shot.viewport);
      await page.goto(shot.url, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
      if (shot.dismiss) {
        const button = page.getByRole("button", { name: shot.dismiss });
        if (await button.isVisible().catch(() => false)) await button.click();
      }
      await page.waitForTimeout(1500);
      const out = join(previewDir, `${shot.name}.png`);
      await page.screenshot({ path: out });
      console.log(`  wrote ${out}`);
    }
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

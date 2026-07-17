/**
 * Generates the site's brand imagery from committed HTML templates so the assets
 * stay reproducible instead of being hand-painted one-offs:
 *
 *   - the default Open Graph share image (public/og/default.png), and
 *   - the on-brand cover placeholders for projects that have no live screenshot
 *     (public/images/<slug>_cover.png).
 *
 * It can also re-shoot the live product screenshots (Aurelian) at a
 * consistent viewport. Rendering goes through Playwright's bundled Chromium (a
 * devDependency already used by the e2e suite), so no extra tooling or font
 * embedding is needed - the templates load the site's Google fonts directly.
 *
 * Usage:
 *   node scripts/generate-assets.mjs            # og + covers -> public/
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

/** Per-status colour, mirrored from components ProjectStatusBadge (dot + resting label). */
const statusStyles = {
  live: { dot: c.signal, text: c.signalInk },
  mvp: { dot: c.pine, text: c.pine },
  concept: { dot: c.moss, text: c.moss },
  experiment: { dot: c.muted, text: c.muted },
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

/** A project cover placeholder: a deliberate, branded slot (not a faked live screenshot). */
function coverTemplate({ name, tagline, slug, status }) {
  const style = statusStyles[status.key];
  return `<!doctype html><html><head><meta charset="utf-8" />${FONT_LINK}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1200px; height: 760px; background: ${c.surface}; font-family: ${FONTS.sans};
           position: relative; overflow: hidden; }
    .texture { position: absolute; inset: 0; background: ${diagonalField}; opacity: 0.55; }
    /* The card renders covers with object-cover / object-top and crops the lower
       ~15%, so the meta row is pinned to the top and the name block is centred
       within the safe upper region rather than the true middle. */
    .top { position: absolute; top: 56px; left: 72px; right: 72px;
           display: flex; align-items: center; justify-content: space-between; }
    .slug { font-family: ${FONTS.mono}; font-size: 20px; letter-spacing: 0.12em; color: ${c.muted}; }
    /* Borderless dot + label, matching the site's ProjectStatusBadge (no pill chrome). */
    .status { font-family: ${FONTS.mono}; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase;
              color: ${style.text}; display: flex; align-items: center; gap: 10px; }
    .status .dot { width: 9px; height: 9px; border-radius: 999px; background: ${style.dot}; }
    .body { position: absolute; left: 72px; right: 72px; top: 44%; transform: translateY(-50%); }
    .name { font-family: ${FONTS.display}; font-weight: 800; font-size: 128px; line-height: 0.9;
            text-transform: uppercase; color: ${c.ink}; letter-spacing: 0.01em; }
    .tagline { font-size: 30px; line-height: 1.4; color: ${c.inkSoft}; max-width: 820px; margin-top: 26px; }
    .rule { height: 2px; width: 88px; background: ${c.pine}; opacity: 0.9; margin-top: 34px; }
  </style></head>
  <body>
    <div class="texture"></div>
    <div class="top">
      <div class="slug">[ ${slug} ]</div>
      <div class="status"><span class="dot"></span>${status.label}</div>
    </div>
    <div class="body">
      <div class="name">${name}</div>
      <div class="tagline">${tagline}</div>
      <div class="rule"></div>
    </div>
  </body></html>`;
}

// Projects that show a generated on-brand cover rather than a live screenshot; their
// taglines and status mirror content/projects/*.ts (German, the canonical base).
// fuelivo joins the set (R-7): its old product screenshot no longer convinced, so it
// now leads with a generated headline cover in the Pressroom system like the rest.
const covers = [
  {
    slug: "fuelivo",
    name: "fuelivo",
    status: { key: "live", label: "Live" },
    tagline: "Fueling für Ausdauerathleten - konkrete Strategien aus wenigen Eingaben.",
  },
  {
    slug: "devblueprint",
    name: "DevBlueprint",
    status: { key: "live", label: "Live" },
    tagline:
      "Ein wiederverwendbares Engineering-Setup für neue Projekte - professioneller Prozess ab Commit eins.",
  },
  {
    slug: "rezepte-app",
    name: "Rezepte App",
    status: { key: "live", label: "Live" },
    tagline: "App zum Sammeln, Ordnen und Wiederfinden von Rezepten.",
  },
  {
    slug: "daily-dashboard",
    name: "Daily Dashboard",
    status: { key: "concept", label: "Konzept" },
    tagline: "Persönliches Dashboard für Produktivität im Tag.",
  },
  {
    slug: "mail-classifier",
    name: "Mail Classifier",
    status: { key: "experiment", label: "Experiment" },
    tagline: "Kleines Tool, das eingehende Mails automatisch einsortiert.",
  },
];

// Live product shots re-captured at a consistent viewport. Written to the preview
// dir first so a regression against the curated originals can be caught by eye
// before anything in public/ is overwritten. Only Aurelian still leads with a real
// screenshot; fuelivo moved to a generated cover (see `covers` above).
const reshoots = [
  {
    name: "aurelian_screen",
    url: "https://aurelian.yannikwuenker.de",
    viewport: { width: 430, height: 932 },
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

  console.log("Project covers:");
  for (const cover of covers) {
    await renderTemplate(
      page,
      coverTemplate(cover),
      { width: 1200, height: 760 },
      join(publicDir, `images/${cover.slug}_cover.png`),
    );
  }

  if (doReshoot) {
    await mkdir(previewDir, { recursive: true });
    console.log("Live re-shoots (preview only):");
    for (const shot of reshoots) {
      await page.setViewportSize(shot.viewport);
      await page.goto(shot.url, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
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

/**
 * Prettier owns all formatting; see docs/engineering/conventions.md.
 * Values that match Prettier defaults are set explicitly so the intent is
 * documented rather than implied. The Tailwind plugin sorts class lists into
 * the canonical order and reads the CSS-first Tailwind v4 config in app/globals.css.
 */

/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./app/globals.css",
};

export default config;

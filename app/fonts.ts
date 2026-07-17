import { Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

/**
 * The site's three typefaces, defined once and shared by both locale root layouts
 * (app/(de) and app/(en)) so the font instances - and their CSS variable names -
 * never diverge between the trees. next/font must be called at module scope, so
 * this module is the single home for that setup.
 *
 * Pairing (Pressroom redesign): a heavy condensed display over an engineering
 * sans, with the mono as the single outlier register (terminal, labels, colophon).
 * Display + body + one outlier is the ceiling - no fourth family.
 */

// Big Shoulders - display / headlines (700 + 800, roman only; headings never
// italicise - emphasis is carried by weight or accent colour instead).
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-big-shoulders",
});

// IBM Plex Sans - body and UI text; also the default document font.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
});

// IBM Plex Mono - labels, kickers, nav, buttons, terminal, technical micro-text.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

/** The three font CSS-variable classes, applied together to the <html> element. */
export const fontVariables = `${bigShoulders.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`;

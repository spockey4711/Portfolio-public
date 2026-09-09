import { statSync } from "node:fs";
import path from "node:path";

import { getCopy } from "@/content/copy";

/**
 * CV (Lebenslauf) availability check.
 *
 * The CV ships as a static asset under `public/`. Every surface that links to it
 * does so only once the file is really there, so an absent CV degrades to nothing
 * instead of a dead link (P1-12).
 *
 * Server-only: this reads the filesystem, so it must be called from a Server
 * Component and never imported into client code. The public path lives in content
 * (`copy.cv.href`) as the single source of truth; here we map it to its on-disk
 * location under `public/`. The CV path is locale-invariant, so the German copy is
 * a fine source for it.
 */

// Strip the leading slash so path.join treats it as relative to public/.
const relativePublicPath = getCopy("de").cv.href.replace(/^\//, "");

/**
 * True when the CV file exists and is non-empty. The size check guards against a
 * placeholder (e.g. a 0-byte `.gitkeep`-style file) being mistaken for a real CV.
 */
export function isCvAvailable(): boolean {
  try {
    const file = path.join(process.cwd(), "public", relativePublicPath);
    return statSync(file).size > 0;
  } catch {
    // Missing file (ENOENT) or any stat error means "not available".
    return false;
  }
}

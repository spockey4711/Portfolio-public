/**
 * The copy accessor: components and pages read their strings via getCopy(locale)
 * instead of importing a single-language singleton, so the same tree renders in
 * German or English. The German source (./de) defines the canonical `Copy` shape;
 * ./en is type-checked against it. See docs/content/i18n.md.
 */

import { type Locale } from "@/lib/i18n/locale";

import { type Copy, deCopy } from "./de";
import { enCopy } from "./en";

export type { Copy } from "./de";

const copyByLocale: Record<Locale, Copy> = {
  de: deCopy,
  en: enCopy,
};

/** The full copy model for a locale. */
export function getCopy(locale: Locale): Copy {
  return copyByLocale[locale];
}

/**
 * TEMPORARY back-compat shim: the German copy under the old singleton name, so
 * components not yet migrated to getCopy(locale) keep compiling during the i18n
 * rollout. Removed once every consumer reads copy per-locale - do not add new
 * usages. See docs/content/i18n.md.
 *
 * @deprecated Use getCopy(locale) instead.
 */
export const copy = deCopy;

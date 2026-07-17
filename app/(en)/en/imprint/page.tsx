import { LegalArticle } from "@/components/legal/LegalArticle";
import { getImprint } from "@/content/legal";
import { alternatesFor } from "@/lib/i18n/routes";

import type { Metadata } from "next";

// The English /en/imprint page (S5-1e), twin of app/(de)/impressum/page.tsx: the
// same shared LegalArticle body rendered from the English Impressum copy, with a
// self canonical and the de-DE/en/x-default hreflang pair (German stays
// x-default). The English text is a courtesy translation; the page's lead states
// that the German version is the legally binding one. Like its German twin, the
// page is noindex/follow - legal pages carry no SEO value (docs/content/seo.md).
const locale = "en";
const imprint = getImprint(locale);
const alternates = alternatesFor("imprint", locale);

export const metadata: Metadata = {
  title: imprint.title,
  description: imprint.description,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  robots: { index: false, follow: true },
};

export default function EnImprintPage() {
  return <LegalArticle page={imprint} locale={locale} />;
}

import { LegalArticle } from "@/components/legal/LegalArticle";
import { getPrivacy } from "@/content/legal";
import { alternatesFor } from "@/lib/i18n/routes";

import type { Metadata } from "next";

// The English /en/privacy page (S5-1e), twin of app/(de)/datenschutz/page.tsx: the
// same shared LegalArticle body rendered from the English Privacy Policy copy, with
// a self canonical and the de-DE/en/x-default hreflang pair (German stays
// x-default). The English text is a courtesy translation; the page's lead states
// that the German Datenschutzerklärung is the legally binding one. Like its German
// twin, the page is noindex/follow - legal pages carry no SEO value
// (docs/content/seo.md).
const locale = "en";
const privacy = getPrivacy(locale);
const alternates = alternatesFor("privacy", locale);

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.description,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  robots: { index: false, follow: true },
};

export default function EnPrivacyPage() {
  return <LegalArticle page={privacy} locale={locale} />;
}

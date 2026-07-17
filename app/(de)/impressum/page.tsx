import { LegalArticle } from "@/components/legal/LegalArticle";
import { getImprint } from "@/content/legal";
import { alternatesFor } from "@/lib/i18n/routes";

import type { Metadata } from "next";

// Legal pages carry no SEO value and should not rank; noindex/follow per
// docs/content/seo.md. The title template appends the site name. Since the
// English twin at app/(en)/en/imprint/page.tsx is live (S5-1e), the page
// advertises the reciprocal de-DE/en/x-default hreflang pair (it previously
// carried only a bare canonical).
const locale = "de";
const imprint = getImprint(locale);
const alternates = alternatesFor("imprint", locale);

export const metadata: Metadata = {
  title: imprint.title,
  description: imprint.description,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return <LegalArticle page={imprint} locale={locale} />;
}

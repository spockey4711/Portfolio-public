import { LegalArticle } from "@/components/legal/LegalArticle";
import { getPrivacy } from "@/content/legal";
import { alternatesFor } from "@/lib/i18n/routes";

import type { Metadata } from "next";

// Legal pages carry no SEO value and should not rank; noindex/follow per
// docs/content/seo.md. The title template appends the site name. Since the
// English twin at app/(en)/en/privacy/page.tsx is live (S5-1e), the page
// advertises the reciprocal de-DE/en/x-default hreflang pair (it previously
// carried only a bare canonical).
const locale = "de";
const privacy = getPrivacy(locale);
const alternates = alternatesFor("privacy", locale);

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.description,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  robots: { index: false, follow: true },
};

export default function DatenschutzPage() {
  return <LegalArticle page={privacy} locale={locale} />;
}

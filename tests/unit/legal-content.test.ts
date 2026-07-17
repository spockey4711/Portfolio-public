import { describe, expect, it } from "vitest";

import { getImprint, getPrivacy, legalEntity, type LegalPage } from "@/content/legal";
import { type Locale } from "@/lib/i18n/locale";

// Guards the legally required substance of the legal pages at the data level, for
// both locales (German canonical, English courtesy translation - S5-1e), so a
// well-formed but incomplete page cannot ship silently. Wording stays loose; only
// the tokens that must be present for compliance are asserted.

describe("legalEntity", () => {
  it("carries the responsible person's name, a full address and a contact email", () => {
    expect(legalEntity.name).not.toHaveLength(0);
    expect(legalEntity.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);

    const { street, postalCode, city, country } = legalEntity.address;
    for (const line of [street, postalCode, city, country]) {
      expect(line).not.toHaveLength(0);
    }
  });
});

const locales: readonly Locale[] = ["de", "en"];

for (const locale of locales) {
  const pages: [string, LegalPage][] = [
    ["imprint", getImprint(locale)],
    ["privacy", getPrivacy(locale)],
  ];

  describe.each(pages)(`%s page structure (${locale})`, (_name, page) => {
    it("has a title, description, last-updated marker and non-empty sections", () => {
      expect(page.title).not.toHaveLength(0);
      expect(page.description).not.toHaveLength(0);
      expect(page.lastUpdated).not.toHaveLength(0);
      expect(page.sections.length).toBeGreaterThan(0);
    });

    it("gives every section a heading and at least one content block", () => {
      for (const section of page.sections) {
        expect(section.heading).not.toHaveLength(0);
        const blocks = [section.paragraphs, section.address, section.links, section.items];
        expect(blocks.some((block) => block && block.length > 0)).toBe(true);
      }
    });
  });
}

// Serialise a page's text so content assertions do not depend on section order.
function textOf(page: LegalPage): string {
  return page.sections
    .flatMap((section) => [
      section.heading,
      ...(section.paragraphs ?? []),
      ...(section.address ?? []),
      ...(section.items ?? []),
      ...(section.links?.map((link) => link.label) ?? []),
    ])
    .join("\n");
}

// The compliance tokens each locale must carry. The English page keeps the German
// statute names (§ 5 DDG, § 18 MStV) since they name German law, but glosses the
// data-protection article style in English (DSGVO -> GDPR).
describe.each(locales)("imprint content (%s)", (locale) => {
  it("names the § 5 DDG and § 18 MStV bases and the contact email", () => {
    const text = textOf(getImprint(locale));
    expect(text).toContain("§ 5 DDG");
    expect(text).toContain("§ 18");
    expect(text).toContain(legalEntity.email);
  });

  it("exposes the contact email as a mailto link", () => {
    const links = getImprint(locale).sections.flatMap((section) => section.links ?? []);
    expect(links).toContainEqual({
      label: legalEntity.email,
      href: `mailto:${legalEntity.email}`,
    });
  });
});

// The GDPR essentials a self-hosted, cookieless site must disclose, per locale.
const privacyTokensByLocale: Record<
  Locale,
  { controller: string; logfiles: string; basisF: string; access: string; complaint: string }
> = {
  de: {
    controller: "Verantwortlich",
    logfiles: "Server-Logfiles",
    basisF: "Art. 6 Abs. 1 lit. f DSGVO",
    access: "Art. 15 DSGVO",
    complaint: "Art. 77 DSGVO",
  },
  en: {
    controller: "Controller",
    logfiles: "server log files",
    basisF: "Art. 6(1)(f) GDPR",
    access: "Art. 15 GDPR",
    complaint: "Art. 77 GDPR",
  },
};

const umamiTokensByLocale: Record<Locale, RegExp[]> = {
  de: [/ohne Cookies/, /IP-Adresse wird nicht dauerhaft gespeichert/],
  en: [/without cookies/, /IP address is not stored permanently/],
};

// The privacy-relevant facts the error/uptime monitoring disclosure must state in
// each locale (the tools are named, IP is scrubbed): matches lib/observability/sentry.ts.
const monitoringIpTokenByLocale: Record<Locale, RegExp> = {
  de: /IP-Adresse wird nicht gespeichert/,
  en: /IP address is not stored/,
};

describe.each(locales)("privacy content (%s)", (locale) => {
  it("covers the GDPR essentials a self-hosted, cookieless site must disclose", () => {
    const text = textOf(getPrivacy(locale));
    const tokens = privacyTokensByLocale[locale];

    // Controller, logfiles + legal basis, self-hosted fonts.
    expect(text).toContain(tokens.controller);
    expect(text).toContain(tokens.logfiles);
    expect(text).toContain(tokens.basisF);
    expect(text).toMatch(/Google Fonts/);

    // Data-subject rights and the right to complain to a supervisory authority.
    expect(text).toContain(tokens.access);
    expect(text).toContain(tokens.complaint);
  });

  it("discloses the self-hosted, cookieless Umami analytics (S2-5)", () => {
    const text = textOf(getPrivacy(locale));

    // The tool is named, and the cookieless / anonymised nature is stated so
    // the disclosure matches what the site actually loads.
    expect(text).toContain("Umami");
    for (const pattern of umamiTokensByLocale[locale]) {
      expect(text).toMatch(pattern);
    }
  });

  it("discloses the self-hosted error/uptime monitoring with the IP scrubbed (S6-2)", () => {
    const text = textOf(getPrivacy(locale));

    // The tools are named (kept verbatim across locales), and the privacy-relevant
    // fact the SDK actually honours (IP removed) is stated so the disclosure matches
    // lib/observability/sentry.ts.
    expect(text).toContain("GlitchTip");
    expect(text).toContain("Uptime Kuma");
    expect(text).toMatch(monitoringIpTokenByLocale[locale]);
  });
});

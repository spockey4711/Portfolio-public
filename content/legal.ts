/**
 * Legal pages content (P1-13, localized in S5-1e): the Impressum and the
 * Datenschutzerklärung in both German and English, plus the shared legal entity
 * (name, postal address, contact) they both draw from. Kept here so the pages hold
 * no language literals and the legally required details live in one reviewable place.
 *
 * The German text is authoritative. The English pages (/en/imprint, /en/privacy)
 * are a courtesy translation for English-speaking readers; where the two diverge,
 * the German version is the legally binding one. Each English page states this in
 * its lead so the disclaimer travels with the copy. Read the copy via
 * getImprint(locale) / getPrivacy(locale) and the shell labels via
 * getLegalChrome(locale), mirroring content/now.ts.
 *
 * Compliance notes:
 * - Impressum per § 5 DDG (Digitale-Dienste-Gesetz, successor to § 5 TMG) and
 *   § 18 Abs. 2 MStV. A full physical address is legally required.
 * - Datenschutzerklärung per DSGVO/GDPR. It reflects the actual, minimal
 *   processing: self-hosted on a Contabo VPS (server logfiles), self-hosted
 *   fonts (no Google connection), no tracking cookies, self-hosted, cookieless
 *   Umami web analytics (aggregate counts, no personal profiles; S2-5), and
 *   self-hosted, cookieless error/uptime monitoring (technical error reports
 *   with the IP scrubbed; S6-2). If the processing changes, update BOTH locales
 *   here - and keep it in lockstep with the SDK's beforeSend scrubbing in
 *   lib/observability/sentry.ts.
 */

import { type Locale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";

export interface LegalSection {
  /** Section heading, rendered as an <h2>. */
  heading: string;
  /** Body paragraphs. */
  paragraphs?: string[];
  /** Postal contact details, rendered inside a semantic <address>. */
  address?: string[];
  /** Labelled links (e.g. the contact email as a mailto). */
  links?: { label: string; href: string }[];
  /** List entries, rendered as an unordered list. */
  items?: string[];
}

export interface LegalPage {
  /** Page heading, rendered as the <h1>. */
  title: string;
  /** Meta description for the page. */
  description: string;
  /** Optional lead paragraph below the title. */
  intro?: string;
  sections: LegalSection[];
  /** Human-readable "last updated" marker in the page's language (e.g. "Juli 2026"). */
  lastUpdated: string;
}

/** Chrome shared with the page shell: the eyebrow, the back link and the "Stand" label. */
export interface LegalChrome {
  /** Mono eyebrow above the title. */
  eyebrow: string;
  /** Back to the onepager, since the nav's section anchors do not resolve here. */
  backToHome: { href: string; label: string };
  /** Prefix for the "last updated" marker at the foot of the page. */
  lastUpdatedLabel: string;
}

// The responsible person and their details, shared by both legal pages. An
// Impressum under § 5 DDG legally requires a complete physical address; keep
// this Anschrift current if it ever changes.
export const legalEntity = {
  name: "Yannik Wünker",
  address: {
    street: "Lövenicher Weg 2b",
    postalCode: "50933",
    city: "Köln",
    country: "Deutschland",
  },
  email: "mail@yannikwuenker.de",
} as const;

// The hosting provider processes the server logfiles on my behalf (Auftrags-
// verarbeitung, Art. 28 DSGVO). Kept as data so the Datenschutz text stays
// accurate if the provider changes.
const hostingProvider = {
  name: "Contabo GmbH",
  address: "Aschauer Straße 32a, 81549 München, Deutschland",
} as const;

const addressLinesDe: string[] = [
  legalEntity.name,
  legalEntity.address.street,
  `${legalEntity.address.postalCode} ${legalEntity.address.city}`,
  legalEntity.address.country,
];

// The English address keeps the German place names (they are proper nouns) but
// renders the country in English, since that is the one line with a translation.
const addressLinesEn: string[] = [
  legalEntity.name,
  legalEntity.address.street,
  `${legalEntity.address.postalCode} ${legalEntity.address.city}`,
  "Germany",
];

// The contact email is language-neutral, so both locales reuse the same link.
const emailLink = {
  label: legalEntity.email,
  href: `mailto:${legalEntity.email}`,
};

const impressumDe: LegalPage = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung nach § 5 DDG.",
  lastUpdated: "Juli 2026",
  sections: [
    {
      heading: "Angaben gemäß § 5 DDG",
      address: addressLinesDe,
    },
    {
      heading: "Kontakt",
      paragraphs: ["Am schnellsten erreichst du mich per E-Mail:"],
      links: [emailLink],
    },
    {
      heading: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
      address: addressLinesDe,
    },
    {
      heading: "Verbraucherstreitbeilegung",
      paragraphs: [
        "Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      ],
    },
    {
      heading: "Haftung für Inhalte",
      paragraphs: [
        "Die Inhalte dieser Seiten wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann ich jedoch keine Gewähr übernehmen. Als Diensteanbieter bin ich für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich, jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.",
      ],
    },
    {
      heading: "Haftung für Links",
      paragraphs: [
        "Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte kann ich keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entferne ich derartige Links umgehend.",
      ],
    },
    {
      heading: "Urheberrecht",
      paragraphs: [
        "Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen meiner schriftlichen Zustimmung.",
      ],
    },
  ],
};

const impressumEn: LegalPage = {
  title: "Legal Notice",
  description: "Legal notice and provider identification pursuant to § 5 DDG.",
  intro:
    "This is an English courtesy translation of the German Impressum. If the two versions differ, the German version is the legally binding one.",
  lastUpdated: "July 2026",
  sections: [
    {
      heading: "Information pursuant to § 5 DDG",
      address: addressLinesEn,
    },
    {
      heading: "Contact",
      paragraphs: ["The quickest way to reach me is by email:"],
      links: [emailLink],
    },
    {
      heading: "Responsible for the content pursuant to § 18 (2) MStV",
      address: addressLinesEn,
    },
    {
      heading: "Consumer dispute resolution",
      paragraphs: [
        "I am neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.",
      ],
    },
    {
      heading: "Liability for content",
      paragraphs: [
        "The contents of these pages were created with the greatest possible care. However, I cannot guarantee that the contents are accurate, complete or up to date. As a service provider, I am responsible for my own content on these pages under the general laws, but I am not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate unlawful activity.",
      ],
    },
    {
      heading: "Liability for links",
      paragraphs: [
        "This website contains links to external third-party websites over whose content I have no influence. I cannot accept any liability for this external content. The respective provider or operator of the linked pages is always responsible for their content. If I become aware of any legal violations, I will remove such links without delay.",
      ],
    },
    {
      heading: "Copyright",
      paragraphs: [
        "The content and works created on this website are subject to German copyright law. Contributions by third parties are marked as such. Reproduction, adaptation, distribution and any kind of exploitation beyond the limits of copyright require my written consent.",
      ],
    },
  ],
};

const datenschutzDe: LegalPage = {
  title: "Datenschutzerklärung",
  description: "Wie diese Website mit personenbezogenen Daten umgeht (DSGVO).",
  intro:
    "Diese Website ist ein privates Portfolio. Ich verarbeite so wenige personenbezogene Daten wie möglich - im Kern nur das, was technisch nötig ist, um die Seite auszuliefern, sowie das, was du mir aktiv per E-Mail schreibst.",
  lastUpdated: "Juli 2026",
  sections: [
    {
      heading: "Verantwortlicher",
      paragraphs: ["Verantwortlich für die Datenverarbeitung auf dieser Website ist:"],
      address: addressLinesDe,
      links: [emailLink],
    },
    {
      heading: "Hosting und Server-Logfiles",
      paragraphs: [
        `Diese Website wird auf einem Server der ${hostingProvider.name} (${hostingProvider.address}) gehostet. Der Hoster verarbeitet die nachfolgend genannten Logdaten in meinem Auftrag; hierzu besteht ein Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO.`,
        "Bei jedem Aufruf speichert der Server automatisch Informationen in sogenannten Server-Logfiles: die IP-Adresse des anfragenden Geräts, Datum und Uhrzeit des Zugriffs, die konkret aufgerufene Seite, die zuvor besuchte Seite (Referrer) sowie den verwendeten Browser und das Betriebssystem.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse liegt im technisch fehlerfreien, sicheren und stabilen Betrieb der Website. Diese Daten werden nicht mit anderen Datenquellen zusammengeführt und gelöscht, sobald sie für den genannten Zweck nicht mehr erforderlich sind.",
      ],
    },
    {
      heading: "SSL-/TLS-Verschlüsselung",
      paragraphs: [
        "Diese Website nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennst du am Schloss-Symbol in der Adresszeile deines Browsers und am Präfix „https://“. Ist die Verschlüsselung aktiv, können die Daten, die du an die Seite übermittelst, nicht von Dritten mitgelesen werden.",
      ],
    },
    {
      heading: "Schriftarten",
      paragraphs: [
        "Die Website verwendet Schriftarten, die beim Erstellen der Seite fest eingebunden und von meinem eigenen Server ausgeliefert werden. Beim Laden der Schriften wird keine Verbindung zu Servern Dritter (etwa Google Fonts) aufgebaut; es werden dabei keine Daten - insbesondere nicht deine IP-Adresse - an Dritte übertragen.",
      ],
    },
    {
      heading: "Cookies und lokale Speicherung",
      paragraphs: [
        "Diese Website setzt keine Cookies und nutzt keine Cookies oder vergleichbaren Technologien zu Analyse- oder Marketingzwecken.",
        "Technisch notwendige Informationen - etwa ob die kurze Startanimation in dieser Sitzung bereits gezeigt wurde - werden ausschließlich lokal in deinem Browser gespeichert und nicht an den Server übertragen oder ausgewertet.",
      ],
    },
    {
      heading: "Kontaktaufnahme per E-Mail",
      paragraphs: [
        "Wenn du mir eine E-Mail schreibst, verarbeite ich deine Angaben (E-Mail-Adresse, Name und den Inhalt deiner Nachricht) ausschließlich zur Bearbeitung deiner Anfrage.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern deine Anfrage der Anbahnung oder Erfüllung eines Vertrags dient, ansonsten Art. 6 Abs. 1 lit. f DSGVO aufgrund meines berechtigten Interesses an der Beantwortung. Ich speichere diese Daten, bis deine Anfrage abschließend bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen; danach werden sie gelöscht.",
      ],
    },
    {
      heading: "Externe Links und Profile",
      paragraphs: [
        "Diese Website verlinkt auf externe Profile und Seiten (zum Beispiel GitHub und LinkedIn). Es handelt sich dabei um einfache Links - es werden keine Daten an diese Anbieter übertragen, solange du den jeweiligen Link nicht aktiv anklickst.",
        "Sobald du einem Link folgst, gelten die Datenschutzbestimmungen des jeweiligen Anbieters, auf dessen Datenverarbeitung ich keinen Einfluss habe.",
      ],
    },
    {
      heading: "Webanalyse mit Umami",
      paragraphs: [
        "Um zu verstehen, wie diese Website genutzt wird, setze ich das datenschutzfreundliche Analysewerkzeug Umami ein. Umami läuft selbst gehostet auf meinem eigenen Server (dieselbe Contabo-Infrastruktur wie die Website); es werden keine Analysedaten an Dritte übertragen.",
        "Umami arbeitet ohne Cookies und ohne geräte- oder websiteübergreifende Wiedererkennung. Deine IP-Adresse wird nicht dauerhaft gespeichert: Aus technischen Angaben der Anfrage wird lediglich ein nicht umkehrbarer, täglich wechselnder Hash gebildet, um Besuche grob zu unterscheiden; ein Rückschluss auf deine Person ist damit nicht möglich. Erhoben werden ausschließlich zusammengefasste, anonyme Kennzahlen wie die aufgerufene Seite, die verweisende Seite, die ungefähre Herkunftsregion (Land) sowie Geräte- und Browsertyp.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse liegt in der bedarfsgerechten Gestaltung und stetigen Verbesserung dieser Website. Da keine Cookies gesetzt und keine dich identifizierenden personenbezogenen Daten gespeichert werden, ist hierfür keine Einwilligung erforderlich. Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO findet nicht statt; deinem berechtigten Widerspruch nach Art. 21 DSGVO komme ich jederzeit nach.",
      ],
    },
    {
      heading: "Fehler- und Verfügbarkeitsüberwachung",
      paragraphs: [
        "Damit technische Fehler dieser Website schnell erkannt und behoben werden können, setze ich das selbst gehostete Werkzeug GlitchTip ein. Es läuft auf meinem eigenen Server (dieselbe Contabo-Infrastruktur wie die Website); es werden keine Fehlerdaten an Dritte übertragen. Tritt in deinem Browser oder auf dem Server ein unerwarteter Fehler auf, wird dazu ein technischer Fehlerbericht erzeugt.",
        "Erhoben werden dabei ausschließlich technische Angaben zum Fehler: die Fehlermeldung samt technischer Aufrufkette (Stack-Trace), die betroffene Seite sowie der grobe Geräte- und Browsertyp. Cookies werden dafür nicht gesetzt. Deine IP-Adresse wird nicht gespeichert; sie wird vor dem Versand entfernt. Die Fehlerberichte deines Browsers werden zudem über die Domain dieser Website geleitet, sodass keine Verbindung zu einem gesonderten Server aufgebaut wird.",
        "Ergänzend prüft ein selbst gehostetes Werkzeug (Uptime Kuma) in regelmäßigen Abständen, ob die Website erreichbar ist. Es ruft dazu ausschließlich eigene technische Adressen dieser Website auf und verarbeitet keine Daten von Besucherinnen und Besuchern.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse liegt im technisch fehlerfreien, sicheren und stabilen Betrieb der Website. Da keine Cookies gesetzt und keine dich identifizierenden personenbezogenen Daten gespeichert werden, ist hierfür keine Einwilligung erforderlich. Die Fehlerberichte werden gelöscht, sobald sie für die Fehlerbehebung nicht mehr erforderlich sind.",
      ],
    },
    {
      heading: "Deine Rechte",
      paragraphs: ["Dir stehen im Rahmen der gesetzlichen Vorgaben jederzeit folgende Rechte zu:"],
      items: [
        "Auskunft über die zu deiner Person gespeicherten Daten (Art. 15 DSGVO)",
        "Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
        "Löschung deiner Daten (Art. 17 DSGVO)",
        "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
        "Datenübertragbarkeit (Art. 20 DSGVO)",
        "Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)",
        "Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)",
      ],
    },
    {
      heading: "Beschwerderecht bei der Aufsichtsbehörde",
      paragraphs: [
        "Unabhängig davon hast du nach Art. 77 DSGVO das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, wenn du der Ansicht bist, dass die Verarbeitung deiner Daten gegen die DSGVO verstößt. Für meinen Wohnsitz zuständig ist die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW).",
      ],
    },
    {
      heading: "Änderungen dieser Datenschutzerklärung",
      paragraphs: [
        "Ich passe diese Datenschutzerklärung an, sobald Änderungen der Website oder der Rechtslage dies erforderlich machen. Es gilt jeweils die hier veröffentlichte, aktuelle Fassung.",
      ],
    },
  ],
};

const datenschutzEn: LegalPage = {
  title: "Privacy Policy",
  description: "How this website handles personal data (GDPR).",
  intro:
    "This website is a private portfolio. I process as little personal data as possible - at its core only what is technically required to serve the site, plus whatever you actively send me by email. This English version is a courtesy translation; the German Datenschutzerklärung is the legally binding one.",
  lastUpdated: "July 2026",
  sections: [
    {
      heading: "Controller",
      paragraphs: ["The controller for the data processing on this website is:"],
      address: addressLinesEn,
      links: [emailLink],
    },
    {
      heading: "Hosting and server log files",
      paragraphs: [
        `This website is hosted on a server operated by ${hostingProvider.name} (${hostingProvider.address}). The host processes the log data described below on my behalf; a data processing agreement pursuant to Art. 28 GDPR is in place for this.`,
        "On every request, the server automatically stores information in so-called server log files: the IP address of the requesting device, the date and time of access, the specific page requested, the previously visited page (referrer), and the browser and operating system used.",
        "The legal basis is Art. 6(1)(f) GDPR. My legitimate interest lies in the technically error-free, secure and stable operation of the website. This data is not merged with other data sources and is deleted as soon as it is no longer required for the stated purpose.",
      ],
    },
    {
      heading: "SSL/TLS encryption",
      paragraphs: [
        "For security reasons, this website uses SSL/TLS encryption. You can recognise an encrypted connection by the lock icon in your browser's address bar and by the „https://“ prefix. When encryption is active, the data you transmit to the site cannot be read by third parties.",
      ],
    },
    {
      heading: "Fonts",
      paragraphs: [
        "The website uses fonts that are embedded when the site is built and served from my own server. When the fonts load, no connection is established to third-party servers (such as Google Fonts); no data - in particular not your IP address - is transferred to third parties in the process.",
      ],
    },
    {
      heading: "Cookies and local storage",
      paragraphs: [
        "This website does not set any cookies and does not use cookies or comparable technologies for analytics or marketing purposes.",
        "Technically necessary information - such as whether the short intro animation has already been shown in this session - is stored exclusively in your browser locally and is not transferred to the server or evaluated.",
      ],
    },
    {
      heading: "Contacting me by email",
      paragraphs: [
        "If you send me an email, I process the details you provide (email address, name and the content of your message) solely to handle your enquiry.",
        "The legal basis is Art. 6(1)(b) GDPR where your enquiry serves to initiate or perform a contract, otherwise Art. 6(1)(f) GDPR on the basis of my legitimate interest in responding. I store this data until your enquiry has been fully dealt with and no statutory retention obligations remain; it is then deleted.",
      ],
    },
    {
      heading: "External links and profiles",
      paragraphs: [
        "This website links to external profiles and pages (for example GitHub and LinkedIn). These are simple links - no data is transferred to these providers unless you actively click the respective link.",
        "As soon as you follow a link, the privacy policy of the respective provider applies, over whose data processing I have no influence.",
      ],
    },
    {
      heading: "Web analytics with Umami",
      paragraphs: [
        "To understand how this website is used, I use the privacy-friendly analytics tool Umami. Umami runs self-hosted on my own server (the same Contabo infrastructure as the website); no analytics data is transferred to third parties.",
        "Umami works without cookies and without cross-device or cross-site recognition. Your IP address is not stored permanently: from technical details of the request, only a non-reversible hash that changes daily is derived in order to distinguish visits roughly; it does not allow any conclusions to be drawn about you as a person. Only aggregated, anonymous metrics are collected, such as the page requested, the referring page, the approximate region of origin (country), and device and browser type.",
        "The legal basis is Art. 6(1)(f) GDPR. My legitimate interest lies in the needs-based design and continuous improvement of this website. Since no cookies are set and no personal data identifying you is stored, no consent is required for this. Automated decision-making, including profiling within the meaning of Art. 22 GDPR, does not take place; I will honour your legitimate objection under Art. 21 GDPR at any time.",
      ],
    },
    {
      heading: "Error and uptime monitoring",
      paragraphs: [
        "So that technical errors on this website can be detected and fixed quickly, I use the self-hosted tool GlitchTip. It runs on my own server (the same Contabo infrastructure as the website); no error data is transferred to third parties. If an unexpected error occurs in your browser or on the server, a technical error report is generated for it.",
        "Only technical details of the error are collected: the error message together with its technical call chain (stack trace), the affected page, and the rough device and browser type. No cookies are set for this. Your IP address is not stored; it is removed before the report is sent. Your browser's error reports are also routed through this website's own domain, so that no connection to a separate server is established.",
        "In addition, a self-hosted tool (Uptime Kuma) checks at regular intervals whether the website is reachable. For this it calls only this website's own technical addresses and processes no data from visitors.",
        "The legal basis is Art. 6(1)(f) GDPR. My legitimate interest lies in the technically error-free, secure and stable operation of the website. Since no cookies are set and no personal data identifying you is stored, no consent is required for this. The error reports are deleted as soon as they are no longer needed for fixing the error.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: ["Within the limits of the law, you have the following rights at any time:"],
      items: [
        "Access to the data stored about you (Art. 15 GDPR)",
        "Rectification of inaccurate data (Art. 16 GDPR)",
        "Erasure of your data (Art. 17 GDPR)",
        "Restriction of processing (Art. 18 GDPR)",
        "Data portability (Art. 20 GDPR)",
        "Objection to processing (Art. 21 GDPR)",
        "Withdrawal of a granted consent with effect for the future (Art. 7(3) GDPR)",
      ],
    },
    {
      heading: "Right to lodge a complaint with a supervisory authority",
      paragraphs: [
        "Irrespective of this, under Art. 77 GDPR you have the right to lodge a complaint with a data protection supervisory authority if you believe that the processing of your data violates the GDPR. The authority responsible for my place of residence is the State Commissioner for Data Protection and Freedom of Information of North Rhine-Westphalia (LDI NRW).",
      ],
    },
    {
      heading: "Changes to this privacy policy",
      paragraphs: [
        "I will amend this privacy policy as soon as changes to the website or the legal situation make it necessary. The current version published here applies in each case.",
      ],
    },
  ],
};

const imprintByLocale: Record<Locale, LegalPage> = { de: impressumDe, en: impressumEn };
const privacyByLocale: Record<Locale, LegalPage> = { de: datenschutzDe, en: datenschutzEn };

const chromeByLocale: Record<Locale, LegalChrome> = {
  de: {
    eyebrow: "Rechtliches",
    backToHome: { href: localizedPath("home", "de"), label: "Zurück zur Startseite" },
    lastUpdatedLabel: "Stand",
  },
  en: {
    eyebrow: "Legal",
    backToHome: { href: localizedPath("home", "en"), label: "Back to home" },
    lastUpdatedLabel: "Last updated",
  },
};

/** The Impressum (legal notice) content for a locale. */
export function getImprint(locale: Locale): LegalPage {
  return imprintByLocale[locale];
}

/** The Datenschutzerklärung (privacy policy) content for a locale. */
export function getPrivacy(locale: Locale): LegalPage {
  return privacyByLocale[locale];
}

/** The legal-page chrome (eyebrow, back link and labels) for a locale. */
export function getLegalChrome(locale: Locale): LegalChrome {
  return chromeByLocale[locale];
}

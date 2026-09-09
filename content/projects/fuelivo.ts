import type { Project } from "./types";

/**
 * fuelivo (Fueling Optimizer) - the featured entry, always first. It is the only
 * project with a full `caseStudy`, so its detail page tells the whole story; the
 * flat fields (tagline, problem, role, links) still feed the onepager card and
 * the index. Facts are drawn from the project's own repository; see
 * docs/content/projects.md.
 */
export const fuelivo: Project = {
  slug: "fuelivo",
  name: "fuelivo",
  tagline: "Fueling für Ausdauerathleten - konkrete Strategien aus wenigen Eingaben.",
  status: "live",
  featured: true,
  order: 1,
  problem:
    "Ausdauersportler müssen im Training und Wettkampf gezielt Kohlenhydrate, Flüssigkeit und Elektrolyte zuführen - zu wenig führt zum Leistungseinbruch, zu viel oder das Falsche zu Magen-Darm-Problemen. Die richtige Menge hängt von vielen Faktoren gleichzeitig ab: Dauer, Intensität, Sportart, Hitze, Magentoleranz. Pauschale Faustregeln wie '60 g Kohlenhydrate pro Stunde' ignorieren das, generische Ernährungs-Apps rechnen Tagesbilanzen statt Sessions, und KI-Coaches liefern Empfehlungen, die man nicht nachvollziehen kann.",
  role: "Alles - Idee, Domänenrecherche, Berechnungslogik, Design, Backend, Web-Frontend und die native iOS-App. KI war dabei Entwicklungswerkzeug, nicht Autopilot.",
  onepager: {
    statement:
      "Die richtige Verpflegung hängt von Dauer, Intensität, Sportart, Hitze und Verträglichkeit ab - pauschale Gramm-pro-Stunde-Regeln greifen zu kurz.",
  },
  learnings: [
    "Zum ersten Mal Backend, Web-Frontend und eine native iOS-App in einem Projekt vereint. Die saubere Schichtung hat sich beim zweiten Client ausgezahlt: die Logik war wiederverwendbar, nur die Transportschicht kam neu dazu.",
    "Zahlungen über zwei Welten - Stripe im Web und Apple StoreKit auf iOS - hinter einem einzigen Entitlement-Service: eine Quelle der Wahrheit für Feature-Flags.",
    "Eine versionierte Mobile-API mit OpenAPI und Contract-Check in der CI ist der Punkt, an dem 'Backend und App driften auseinander' aufhört, ein Problem zu sein.",
    "Erstes Projekt, das über ein einzelnes Python-Skript mit README hinausgewachsen ist - inklusive eigener Domain, DNS, CI/CD und Deployment.",
    "Beim nächsten Mal: ein klarer Deployment-Pfad statt parallel Docker und Vercel, und früher gemeinsame Typen zwischen Backend und iOS.",
  ],
  links: { live: "https://fuelivo.de" },
  media: { cover: "/images/fuelivo_cover.png" },
  detailPage: true,
  caseStudy: {
    // Mounts the interactive proof widget under the solution (S4-5): a live,
    // deterministic mini-calculator that lets a visitor watch the reasoning.
    interactiveProof: true,
    summary:
      "fuelivo ist ein regelbasierter Rechner für Sporternährung. Ausdauersportler und Trainer geben Session-Parameter ein - Gewicht, Dauer, Intensität, Sportart, Bedingungen - und bekommen konkrete Kohlenhydrat-, Natrium- und Flüssigkeitsziele in g, ml und mg, aufgeteilt auf vor, während und nach der Einheit. Die Empfehlungen sind bewusst deterministisch: keine Blackbox, jede Ausgabe trägt eine Begründung und Warnhinweise. Backend, Web-App und eine native iOS-App teilen sich dieselbe Logik.",
    solution: {
      intro:
        "fuelivo bildet publizierte Sporternährungs-Heuristiken als deterministische Regel-Engine ab. Für jede Session werden Ziele pro Stunde berechnet, auf die Gesamtdauer hochgerechnet und in konkrete Produkte übersetzt - Getränk, Gel, Riegel, Banane. Jeder Rechenschritt erzeugt einen Klartext-Grund, Grenzfälle erzeugen Warnungen. Es positioniert sich bewusst als Sportwissenschafts-Rechner, nicht als KI-Coach.",
      highlights: [
        "Kohlenhydrate pro Stunde: ein Basiswert aus der Dauer plus additive Modifikatoren für Intensität, Sportart und Hitze, gedeckelt durch eine Toleranz-Matrix aus Magenempfindlichkeit und Magentraining.",
        "Flüssigkeit und Natrium pro Stunde, je nach Intensität und Sportart, optional durch eine gemessene Schweißrate übersteuert.",
        "Drei Phasen: Aufladen vorher, getaktete Zufuhr während, Recovery mit Protein danach - plus ein Race-Schedule mit Aid-Station-Timing.",
        "Die Gesamtmenge wird in einkaufsfertige Produkte übersetzt: je nach Verpflegungszugang reines Getränk, Getränk plus Gel oder ein Realkost-Mix.",
        "Eigene Engines für Gym-Training und Race-Day, weil deren Rechenmodelle grundlegend anders sind - getrennt gehalten für unabhängige Wartbarkeit.",
      ],
    },
    features: [
      { label: "Öffentlicher Rechner ohne Login", status: "done" },
      { label: "Transparente Begründung und Warnhinweise", status: "done" },
      { label: "Drei-Phasen-Empfehlung (vor, während, nach)", status: "done" },
      { label: "Konkrete Produkt-Optionen pro Phase", status: "done", tag: "Pro" },
      { label: "Race-Plan mit Aid-Station-Taktung", status: "done", tag: "Pro" },
      { label: "Gym- und Kraft-Rechner", status: "done" },
      { label: "Athleten-Dashboard mit Historie", status: "done", tag: "Pro" },
      { label: "Coach-Portal mit Roster und Vorlagen", status: "done", tag: "Coach" },
      { label: "Auth, Google-OAuth und Sign in with Apple", status: "done" },
      { label: "Stripe- und Apple-StoreKit-Abos", status: "done" },
      { label: "i18n Deutsch/Englisch", status: "done" },
      { label: "Native iOS-App", status: "done" },
    ],
    techStack: [
      {
        name: "Backend",
        items: ["Python 3.11", "FastAPI", "SQLAlchemy 2 (async)", "Alembic", "Jinja2", "PyJWT"],
      },
      {
        name: "Web-Frontend",
        items: ["React 18", "React Router", "Vite", "Tailwind CSS", "i18next", "React Email"],
      },
      {
        name: "iOS",
        items: [
          "SwiftUI",
          "Eigenes Design-System",
          "StoreKit",
          "Sign in with Apple",
          "xcconfig-Environments",
        ],
      },
      {
        name: "Daten & Infrastruktur",
        items: [
          "PostgreSQL (Neon)",
          "Repository-Pattern",
          "Docker Compose",
          "GitHub Actions",
          "Vercel",
        ],
      },
      {
        name: "Zahlungen & Betrieb",
        items: ["Stripe", "Apple StoreKit", "Entitlement-Service", "Resend", "PostHog", "Sentry"],
      },
      {
        name: "Qualität",
        items: ["pytest", "Playwright", "xcodebuild", "OpenAPI-Contract-Check", "5 CI-Workflows"],
      },
    ],
    architecture: {
      intro:
        "FastAPI liefert eine Jinja2-Shell aus, die die gebaute React-SPA lädt und Auth- und Entitlement-Status direkt ins HTML injiziert - kein zusätzlicher Roundtrip. Die iOS-App spricht dieselbe Domänenlogik über eine dedizierte, versionierte Mobile-API. Innen gilt durchgängig Route → Service → Repository.",
      points: [
        "Route → Service → Repository: dünne Routen, testbar isolierte Geschäftslogik, beim zweiten Client wiederverwendbar.",
        "Berechnungszeilen sind append-only - ein unveränderlicher Audit-Trail statt mutierter Datensätze.",
        "State-mutierende POSTs sind mit einem Double-Submit-CSRF-Token abgesichert.",
        "Sentry, PostHog und die DB sind fail-open: fehlende Config blockiert den lokalen Start nicht.",
        "Ein Contract-Check in der CI verhindert, dass Backend und iOS-App auseinanderdriften.",
      ],
    },
    challenges: [
      {
        title: "Die Kernformel migrieren, ohne Ergebnisse zu verfälschen",
        problem:
          "Das ursprüngliche multiplikative Modell sollte auf ein nachvollziehbareres additives Matrix-Modell umgestellt werden - ohne dass sich Empfehlungen unbemerkt verschieben.",
        solution:
          "Beide Modi bleiben im Code, umschaltbar per Env-Flag, mit einem Shadow-Compare-Modus zum Parallelvergleich. Die Umstellung war risikoarm, die alte Logik bleibt reproduzierbar.",
      },
      {
        title: "Ein Entitlement-Modell über zwei Zahlungswelten",
        problem:
          "Pro-Zugang kann via Stripe im Web oder via Apple StoreKit auf iOS bestehen. Routen dürfen den Zahlungsstatus nie direkt prüfen.",
        solution:
          "Ein zentraler Entitlement-Service löst Free, Pro und Coach über beide Anbieter hinweg auf - eine einzige Quelle der Wahrheit für Feature-Flags.",
      },
      {
        title: "Backend und native iOS-App synchron halten",
        problem:
          "Zwei Clients an einer API: Vertragsbrüche fallen sonst erst spät und beim Nutzer auf.",
        solution:
          "Eine dedizierte, versionierte Mobile-API mit OpenAPI-Spec und einem eigenen Contract-Check-Workflow. Drift wird schon im Pull Request erkannt.",
      },
      {
        title: "Der Sportart-Spezialfall Schwimmen",
        problem:
          "Gel oder Riegel während der Einheit sind im Becken unpraktisch - generische Verpflegung ergibt keinen Sinn.",
        solution:
          "Eine eigene Pool-Flaschen-Logik mit Kohlenhydratpulver und Elektrolyttablette samt Sip-Timing an der Wand, plus Elektrolyt-Warnung.",
      },
    ],
    metrics: [
      { value: "3", label: "Plattformen (Backend, Web, iOS)" },
      { value: "~16.100", label: "Zeilen Python (Backend)" },
      { value: "~17.200", label: "Zeilen Swift (iOS)" },
      { value: "269", label: "Commits" },
      { value: "13", label: "Datenbank-Tabellen" },
      { value: "5", label: "CI-Workflows" },
    ],
    timeline: [
      {
        period: "März 2026",
        title: "Fundament",
        description:
          "In wenigen Wochen entstehen Rechen-Engine, Web-SPA, Auth, Billing und Coach-Portal - 257 der 269 Commits fallen in diesen Monat.",
      },
      {
        period: "Ende März",
        title: "Reife",
        description:
          "CI-Workflows, OpenAPI-Contract-Check, Dokumentation und das neue Matrix-Rechenmodell neben der Legacy-Formel.",
      },
      {
        period: "April - Mai",
        title: "iOS & Billing",
        description:
          "Native SwiftUI-App, i18n und Accessibility, Apple-StoreKit-Abos und die vereinheitlichte Entitlement-Auflösung über Stripe und Apple.",
      },
      {
        period: "Juni",
        title: "Feinschliff",
        description:
          "Anpassung der Fueling-Dauergrenzen und letzte Politur; der letzte Commit fällt auf den 17.06.2026.",
      },
    ],
  },
};

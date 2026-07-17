import type { Project } from "./types";

/**
 * Aurelian - eine iOS-first App fuer taegliche stoische Reflexion. Zweites
 * Projekt mit voller `caseStudy`, gezogen aus dem eigenen Repository und der
 * Produktbeschreibung; die flachen Felder (tagline, problem, role, links)
 * speisen die Onepager-Karte und den Index. Siehe docs/content/projects.md.
 */
export const aurelian: Project = {
  slug: "aurelian",
  name: "Aurelian",
  tagline: "Taegliche stoische Reflexion in unter zwei Minuten - auf den echten Tag bezogen.",
  status: "mvp",
  order: 2,
  problem:
    "Stoizismus-Apps liefern generische Zitate ohne Bezug zum Alltag, Journal-Apps verlangen zu viel Input und fuehlen sich nach Arbeit an, und KI-Reflexionstools erfinden Zitate - bei philosophischen Quellen zerstoert das die Glaubwuerdigkeit sofort. Ambitionierte Nutzer wollen einen kurzen, praktischen Moment der Klarheit vor dem Tag: keine To-do-Liste, keinen Coach-Ton, keine erfundenen Weisheiten.",
  role: "Alles end-to-end - Produktdefinition und PRD, modulare local-first Architektur, SwiftUI-Frontend, Domaenen- und Anwendungslogik als Swift Package, Kuratierung der geprueften Zitat-Datenbank, den gehaerteten Node-Backend-Endpoint fuer die KI-Generierung sowie Deployment, App-Store-Vorbereitung und Test-Strategie.",
  learnings: [
    "Eine port-basierte, modulare Architektur haelt Produktregeln unabhaengig von SwiftUI und SwiftData testbar - die Domaenenschicht haengt von nichts ab und laesst sich ohne iOS-Simulator pruefen.",
    "Zitat-Halluzinationen sind kein Prompt-Problem, sondern ein Architektur-Problem: geloest durch eine deterministische Selektionspolicy, die der KI nur zulaessige Kandidaten uebergibt - die KI waehlt aus, erfindet nie.",
    "Die Generierung vom Client auf einen stateless Server-Endpoint zu verlagern, schuetzt den API-Key, deckelt die Kosten (ein Output pro Nutzer pro Tag) und erlaubt trotzdem einen lokalen Offline-Fallback.",
    "Text-Input-Latenz auf iOS ist real: eine eigene Untersuchung und Pufferung der Eingaben hat den Heute-Screen fluessig gehalten.",
  ],
  links: { live: "https://aurelian.yannikwuenker.de/" },
  media: { cover: "/images/aurelian_screen.png", orientation: "portrait" },
  detailPage: true,
  caseStudy: {
    summary:
      "Aurelian hilft, den Tag in unter zwei Minuten stoisch auszurichten. Die App verbindet ein persoenliches 12-Wochen-Fokusziel, die wichtigsten Aufgaben des Tages, das aktuelle Energie-Level und gepruefte stoische Zitate zu einer kurzen, konkreten Tagesreflexion. Bewusst nicht noch eine Quote-of-the-Day-App, sondern eine stoische Perspektive auf den echten Tag des Nutzers - ruhig und erwachsen im Ton, ohne Motivationsfloskeln.",
    solution: {
      intro:
        "Der Kern ist ein sehr kurzer Daily Loop. Morgens traegt der Nutzer ein bis drei wichtige Dinge ein, ergaenzt optional, was ihn beschaeftigt, und waehlt sein Energie-Level; daraus erzeugt Aurelian eine stoische Perspektive und eine konkrete Tagesregel. Abends folgen zwei bis drei kurze Fragen. Der Output ist strikt strukturiert und die KI waehlt ausschliesslich aus geprueften, lokal bereitgestellten Zitat-Kandidaten.",
      highlights: [
        "Fixe Output-Struktur: Zitat, Quelle, heutige Perspektive, Kontrollfrage, Tagesregel, Abendfrage - kurz und konkret statt Motivationsrede.",
        "Die KI referenziert genau eine Zitat-ID aus den uebergebenen Kandidaten und darf Zitate, Quellen oder Autoren nie erfinden.",
        "Morning Check-in in unter zwei Minuten: Prioritaeten, optionaler Freitext, Energie-Level (Niedrig / Normal / Hoch).",
        "Abend-Reflexion bewusst kurz: drei Fragen, maximal drei Minuten, kein Analysedruck - lokal gespeichert.",
        "Offline-Fallback: ist kein KI-Endpoint konfiguriert oder erreichbar, generiert die App lokal weiter.",
      ],
    },
    features: [
      { label: "Minimal-Onboarding (max. 4 Screens)", status: "done" },
      { label: "Morning Check-in (Prioritaeten, Freitext, Energie)", status: "done" },
      { label: "Strukturierter stoischer Output", status: "done" },
      { label: "Gepruefte Zitat-Datenbank mit Provenienz", status: "done" },
      { label: "Abend-Reflexion (drei kurze Fragen)", status: "done" },
      { label: "Journal / Verlauf mit Detailansicht", status: "done" },
      { label: "Lokale Reminder-Notifications", status: "done" },
      { label: "Offline-Fallback ohne KI-Endpoint", status: "done" },
      { label: "Remote-Generierung ueber Groq-Endpoint", status: "done" },
      { label: "Favoriten und editierbares Fokusziel", status: "planned", tag: "V0.2" },
      { label: "Weekly Review / Wochenrueckblick", status: "planned", tag: "V0.3" },
      { label: "Paywall, Export (PDF/Markdown), Life Wheel", status: "planned", tag: "V1.0" },
    ],
    techStack: [
      {
        name: "iOS-App",
        items: ["SwiftUI", "SwiftData", "UserDefaults", "UserNotifications", "XcodeGen"],
      },
      {
        name: "Kern (Swift Package)",
        items: ["Swift 6", "Swift Package Manager", "5 modulare Library-Targets"],
      },
      {
        name: "Backend / KI",
        items: ["Node.js", "Stateless-Endpoint", "Groq (LLM)", "Structured Outputs"],
      },
      {
        name: "Betrieb & Compliance",
        items: [
          "Fixed-Window Rate-Limiting",
          "Serverseitiger API-Key",
          "Statische Public-Site",
          "App-Store-Signing",
        ],
      },
      {
        name: "Qualitaet",
        items: ["26 Test-Dateien", "5 Test-Targets", "iOS-Unit- & UI-Tests", "iOS-E2E"],
      },
    ],
    architecture: {
      intro:
        "Local-first und modular, mit klaren Grenzen zwischen Produktregeln und technischen Details (UI, Persistenz, Notifications, KI-Provider). Ein plattformunabhaengiges Swift Package ist in fuenf Library-Targets geschnitten (Domain, Application, Content, Infrastructure, Design); die SwiftUI-App komponiert sie. Bevorzugt werden klare Boundaries statt schwerer Abstraktionen.",
      points: [
        "Abhaengigkeitsrichtung: apps/ios -> Application -> Domain; die Domaenenschicht haengt von nichts ab - kein UI, keine Persistenz, kein Netzwerk, kein KI-SDK.",
        "Die KI ist ein Adapter hinter dem Application-Contract DailyReflectionGeneratorPort: sie bekommt Nutzerkontext plus Zitat-Kandidaten und liefert strukturierten Output, der genau eine Zitat-ID referenziert.",
        "Kern-Ports entkoppeln die Aussenwelt: DailyEntryRepository, FocusGoalRepository, UserPreferencesRepository, QuoteRepository, Clock, IDGenerator.",
        "Content -> Domain und Infrastructure -> Content: das gepruefte Zitat-Dataset lebt hinter einem QuoteRepository, nicht verstreut im UI-Code.",
        "Die Generierung laeuft ueber einen stateless Node-Endpoint mit serverseitigem Key; faellt er aus, uebernimmt der lokale Fallback ohne Nutzerbruch.",
      ],
    },
    challenges: [
      {
        title: "Zitat-Halluzinationen verhindern",
        problem:
          "Die zentrale Vertrauensfrage: erfindet die KI Zitate, Autoren oder Quellen, zerstoert das bei philosophischen Texten sofort die Glaubwuerdigkeit.",
        solution:
          "Eine gepruefte lokale Datenbank plus eine deterministische QuoteSelectionPolicy uebergibt der KI nur zulaessige Kandidaten. Die KI waehlt genau eine ID aus, erfindet aber nie - Provenienz (Autor, Werk, Referenz) bleibt garantiert echt.",
      },
      {
        title: "KI klingt generisch",
        problem:
          "Standard-Prompts erzeugen austauschbare Motivationssprueche ohne Bezug zum echten Tag des Nutzers.",
        solution:
          "Ein sehr strikter Prompt mit echten Tagesdaten im Kontext und kurzen, konkreten Outputs statt Motivationsreden - eine stoische Perspektive auf genau diesen Tag.",
      },
      {
        title: "API-Key-Schutz und Kosten",
        problem:
          "Direkte In-App-Aufrufe an den LLM-Provider legen den Key offen und machen die Kosten unkontrollierbar.",
        solution:
          "Verlagerung der Generierung auf einen stateless Server-Endpoint mit serverseitigem Key, Fixed-Window Rate-Limiting, begrenzten Retries und genau einem Output pro Nutzer pro Tag.",
      },
      {
        title: "Testbarkeit trotz iOS-Abhaengigkeiten",
        problem:
          "SwiftUI und SwiftData sind schwer isoliert testbar - Produktregeln drohen an das UI-Framework gekettet zu werden.",
        solution:
          "Die modulare, port-basierte Architektur haelt Domaenen- und Anwendungslogik unabhaengig von SwiftUI/SwiftData und damit ueber 26 Test-Dateien in fuenf Test-Targets pruefbar.",
      },
    ],
    metrics: [
      { value: "~4.500", label: "Zeilen Swift-Code" },
      { value: "~85", label: "Swift-Dateien" },
      { value: "5", label: "modulare Package-Targets" },
      { value: "80", label: "gepruefte Zitate" },
      { value: "26", label: "Test-Dateien" },
      { value: "1", label: "produktiver KI-Endpoint" },
    ],
    timeline: [
      {
        period: "29. April 2026",
        title: "Fundament in einem Tag",
        description:
          "Domain-Package, Content-Validierung, Daily-Entry-Regeln, Design-Tokens, erste Application-Use-Cases (Onboarding, Morning Check-in), SwiftData-Repositories und eine SwiftUI-App-Shell mit verdrahtetem Onboarding, Check-in, Journal und Focus.",
      },
      {
        period: "30. April - 1. Mai",
        title: "Persistenz & Zitat-Policy",
        description:
          "Vertiefte Persistenz, erweitertes Onboarding und Journal-Detail; dann die deterministische Zitat-Selektionspolicy, der Ausbau des Katalogs, die Entscheidung fuer Groq, ein Remote-Reflection-Adapter, der lokale Notification-Scheduler und erste Tests.",
      },
      {
        period: "2. Mai",
        title: "Endpoint live & E2E",
        description:
          "Stateless Groq-Endpoint implementiert, gehaertet, produktiv deployed und per iOS-E2E validiert; dazu App-Store-Signing, Shell-Assets und die oeffentlichen Marketing-, Datenschutz- und Support-Seiten.",
      },
      {
        period: "3. Mai",
        title: "Compliance & Feinschliff",
        description:
          "App-Store-Compliance-Antworten, Store-Metadaten-Entwurf, Politur der Accessibility-Texte und Pufferung der Text-Eingaben. Status seither: Client MVP Ready / App Store Release Prep.",
      },
    ],
  },
};

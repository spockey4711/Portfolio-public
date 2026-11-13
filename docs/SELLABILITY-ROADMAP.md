# Sellability-Roadmap — Vorschlag, nicht freigegeben

**Status: Vorschlag. `awaiting_approval`. Nichts in dieser Datei ist umgesetzt, beauftragt
oder ein Grund, Features zu bauen.**

Stand: Checkout `471127543257c3d7aee01cd6eec3670d5bed87a2`, Branch
`agent/completion-batch-1`. Nur gelesen plus die in diesem Change korrigierte Doku und
die freigegebenen Tests. Keine Nutzer befragt, keine Zahlungsbereitschaft gemessen, keine
Marktstatistik. Offene GitHub-Issues: keine. Die API listet zwei offene Einträge, beide
Pull Requests (`#43` Release, `#48` Dependabot), keine Issues. Keine neuen Issues
angelegt. Pakete unten wiederholen deshalb keine Ticketnummern, die es nicht gibt, und
verweisen auf den bestehenden Abschlussplan, statt Duplikate zu erfinden.

## Zuerst die Unterscheidung

Dieses Repository ist ein **persönliches Portfolio** zur eigenen Darstellung und
Kontaktaufnahme (`docs/00-overview.md`, `README.md`). Es hat keine Nutzerkonten, keinen
Warenkorb und keinen Preis. Daraus folgt kein SaaS.

Eigenständige Produkte stehen nur als **Fallstudien-Text** in `content/projects/`. Deren
Code, Builds und Shops liegen nicht in diesem Tree. Diese Datei entscheidet keinen
Domain-Konflikt zwischen Portfolios und erfindet keinen zweiten Auftritt.

| Gegenstand | Was es in diesem Repo ist | Verkaufbares Produkt? |
|---|---|---|
| yannikwuenker.de / dieser Tree | Persönliche Kundengewinnung und Nachweis | Nein. Hypothese: indirekt Anfragen. Kein Preis, keine Evidenz. |
| fuelivo | Text und Links in `content/projects/fuelivo.ts` | Hypothese, anderes Repo. Hier nicht prüfbar. |
| Aurelian | Text, Status `mvp`, iOS | Hypothese, anderes Repo. macOS-Build hier nicht möglich. |
| DevBlueprint | Öffentliches MIT-CLI, laut Copy anti-Lock-in | Kein SaaS-Zwang. Bezahlmodell nicht belegt. |
| Rezepte App | Kurzer Index-Eintrag, kein Detail | Persönliches Werkzeug laut Dateikommentar. Nicht belegt als Produkt. |
| Daily Dashboard | Status `concept`, SwiftUI macOS | Nicht gebaut in diesem Repo. Hier nicht bauen oder als gebaut ausgeben. |
| Mail Classifier | Status `experiment`, lokales CLI | Kein Produktbeleg. |
| Hockey | Freizeit-Satz in `content/copy/de.ts` | Keine App in diesem Repo. Ein Mac-Build wird hier nicht vorgetäuscht. |

## 1. Nutzeranforderung, vorhandener Flow, echte Lücke

Nur Anforderungen, die eine Datei in diesem Checkout belegt.

### Wer in etwa 30 Sekunden versteht, wer hier schreibt

- **Anforderung:** `docs/00-overview.md`, Abschnitt Success criteria.
- **Flow:** Hero-Masthead `components/sections/hero/Hero.tsx`, zusammengesetzt in
  `components/sections/Onepager.tsx`, Routen `app/(de)/page.tsx` und
  `app/(en)/en/page.tsx`.
- **Lücke:** keine fehlende Route für diesen Satz. Ob ein fremder Leser ihn so versteht,
  ist nicht gemessen. Ob Produktion diesen Commit ausliefert, ist nicht belegt.

### Echte, selbst gebaute Projekte, fuelivo als wichtigstes

- **Anforderung:** dieselbe Success-criteria-Liste; fuelivo ist `featured` in
  `content/projects/fuelivo.ts`.
- **Flow:** Projektband auf der Home-Seite, Index `/projekte`, Detail
  `/projekte/fuelivo` (Englisch `/en/projects/fuelivo`).
- **Lücke:** Die Detailseite kann Screenshots rendern (`content/projects/types.ts`,
  Changelog `0.5.0`). Kein Projekt setzt `caseStudy.screenshots`. Der Unit-Test sagt das
  ausdrücklich (`tests/unit/project-screenshots.test.ts`). Cover-Bilder sind nicht die
  Gallery. Das ist eine Beleglücke der Portfolio-Erzählung, kein Auftrag, Bilder zu
  erzeugen.

### Kontakt ist ohne Suche erreichbar

- **Anforderung:** Success criteria, „contact paths are trivial to find“.
- **Flow:** Kontaktband, `mailto:mail@yannikwuenker.de`, LinkedIn, GitHub
  (`content/copy/de.ts`, Kontaktblock).
- **Lücke:** Die Mail ist da. LinkedIn trägt den Kommentar
  `TODO(open): confirm the final LinkedIn profile URL` (`content/copy/de.ts`). Die URL
  ist nicht geprüft. Der Lead wirbt mit „Werkstudentenstelle“, während
  `SHOW_AVAILABILITY` standardmäßig aus ist (`lib/config/features.ts`, `.env.example`).
  Das ist eine offene Entscheidung, kein Bugfix dieses Changes.

### „Wie ich arbeite“

- **Anforderung:** `docs/content/content-and-voice.md`, Abschnitt Way of working;
  Erzählbogen in `docs/00-overview.md`.
- **Flow:** Copy-Schlüssel `wayOfWorking` in `content/copy/de.ts` und `content/copy/en.ts`.
- **Lücke:** Keine Komponente importiert den Schlüssel. Die Sektion ist nicht sichtbar.
  Mounten oder streichen ist nicht entschieden.

### Scroll-Spine als Signatur

- **Anforderung:** `docs/design/animation-and-motion.md` beschreibt Linie, Füllung und
  Punkt als bindende Spec. `docs/00-overview.md` nennt sie nicht mehr als gebaut.
- **Flow:** `lib/hooks/use-scroll-progress.ts` schreibt die Nav-Prozentzahl. Ein
  Spine-Element wird von keiner Seite gemountet.
- **Lücke:** Spec und UI widersprechen sich. Bauen oder Spec streichen ist nicht
  freigegeben. Dieser Vorschlag setzt keines von beiden um.

### Nachweis, dass regelmäßig Code entsteht

- **Anforderung:** Kommentar in `Onepager.tsx`: die Heatmap ist das eine Signatur-Widget.
- **Flow:** `GithubActivity` auf `/` und `/en`, Route `app/api/github-activity/route.ts`.
  Ohne Token oder bei Fehler: `{ available: false }` und statische Caption.
- **Lücke im Produkt:** keine, solange der Fallback gewollt ist. Die Browser-Prüfung
  dieses Fallbacks ist mit diesem Change ergänzt
  (`tests/e2e/github-activity-fallback.spec.ts`), nicht ein neues Widget.

### Rechtstexte

- **Anforderung:** `docs/00-overview.md`, Legal.
- **Flow:** `/impressum`, `/datenschutz` und englische Zwillinge.
- **Lücke:** Existenz ist kein offener Punkt. Inhaltliche Richtigkeit der Rechtstexte ist
  hier nicht geprüft.

## 2. Nächste Pakete

Maximal fünf. Alle **`awaiting_approval`**. Keines wird in diesem Change gebaut. Sie
sind die schon im Abschlussplan benannten Lücken, keine neuen Tickets.

| ID | Paket | Akzeptanz, messbar | Aufwand | Abhängigkeit | Status |
|---|---|---|---|---|---|
| P0-2 | Scroll-Spine bauen oder Spec, Overview-Rest und Hook-Kommentar im selben Change auf „nur Nav-Prozent“ reduzieren | Entweder ein DOM-Element, dessen Höhe dem Hook-Ratio folgt, plus Reduced-Motion-Pfad, oder kein Spine-Soll in den öffentlichen Specs | M beim Bau, S beim Streichen | Produktentscheidung | awaiting_approval |
| P0-3 | Echte Screenshots nur für Projekte, die als belegt gelten | Benannte Slugs haben `screenshots.length > 0` mit `alt` und `caption` in DE und EN; Detailseite zeigt die Sektion; keine generierten Platzhalter | M | Welche Projekte „carried“ sind; echte Aufnahmen von Yannik | awaiting_approval |
| P1-1 | Terminal, Wetter, Spotify, WakaTime, Signals mounten oder aus der Rendering-Doku als nicht ausgeliefert kennzeichnen, falls ein Satz das noch behauptet | Jedes dort als live beschriebene Widget ist von einer Route unter `app/` importiert, oder der Satz ist weg | M | Was Besucher sehen sollen | awaiting_approval |
| P1-2 | Sichtbares Deutsch mit Umlauten in den Projektstrings; `wayOfWorking` zeigen oder aus Copy und Content-Doku entfernen | Kein `Taeglich` / `fuer ` / `geprueft` mehr in `content/projects/*.ts`; entweder die Überschrift im gerenderten Home oder kein `wayOfWorking`-Key | S | Ob die Prinzipien bleiben | awaiting_approval |
| P2-1 | `SHOW_AVAILABILITY` und die Werkstudenten-Formulierung auf eine Linie bringen | Die Hero-Zeile erscheint genau dann, wenn das Flag im dokumentierten Build an ist; die Kontakt-Copy behauptet keine Stelle, die das Flag verneint | S | Entscheidung von Yannik | awaiting_approval |

Nicht in dieser Liste, weil sie keine Feature-Pakete dieses Repos sind: Release-Merge
`#43`, Dependabot `#48`, ein Hockey- oder Mac-Build, eine Zahlungsintegration.

## 3. Zielgruppe, Problem, Nutzen, Monetarisierung

Alles in diesem Abschnitt ist **Hypothese** oder ein Zitat der eigenen Copy. Nichts davon
ist eine gemessene Nachfrage.

### Portfolio (dieses Repo)

- **Zielgruppe, aus `docs/00-overview.md`, nicht validiert:** Recruiter und Hiring
  Manager im DACH-Raum, technische Leser, mögliche Projektpartner. Sekundär: Netz und
  Kommilitonen.
- **Kernproblem, Autorenrahmen:** Ein statischer Lebenslauf zeigt nicht, was gebaut wurde
  und wie. Die Seite soll das in einem Durchlauf tun.
- **Möglicher Nutzen:** Jemand findet Mail und ein Projekt, ohne zu suchen. Ob das
  passiert, ist nicht gemessen.
- **Monetarisierung:** keine. Die Seite hat keinen Preis. Eine indirekte Hypothese ist,
  dass sie zu einer Werkstudenten- oder Projektanfrage führt. Zahlungsbereitschaft,
  Stundensatz und Conversion sind nicht belegt und werden hier nicht geschätzt.

### fuelivo (anderes Produkt, nur Copy)

- **Zielgruppe, Hypothese aus `content/projects/fuelivo.ts`:** Ausdauersportler, die eine
  Session-Verpflegung brauchen, nicht eine Tagesbilanz.
- **Kernproblem, Copy:** Pauschale Gramm-pro-Stunde-Regeln ignorieren Dauer, Intensität,
  Hitze und Verträglichkeit.
- **Möglicher Nutzen, Copy:** Eine nachvollziehbare Strategie aus wenigen Eingaben.
- **Monetarisierung:** Die Learnings erwähnen Stripe und StoreKit hinter einem
  Entitlement-Service. Das ist eine Behauptung über ein anderes Repository, kein Beleg
  für Umsatz, Preis oder zahlende Nutzer. Dieser Checkout führt keinen Shop-Test aus.
  Domain `fuelivo.de` ist nur ein Link. Ein Konflikt mit einem anderen Portfolio wird
  hier nicht entschieden.

### Aurelian (anderes Produkt, nur Copy)

- **Zielgruppe, Hypothese:** Menschen, die eine kurze, tagesbezogene stoische Reflexion
  wollen, keine Zitat-App.
- **Kernproblem, Copy:** Generische Zitate, zu viel Journal-Input, erfundene Zitate.
- **Möglicher Nutzen, Copy:** Unter zwei Minuten, Zitate aus einer geprüften lokalen
  Datenbank.
- **Monetarisierung:** nicht belegt. Ein App-Store-Preis steht hier nicht. Ein iOS- oder
  Mac-Build ist auf diesem Linux-Host nicht ausführbar und wird nicht behauptet.

### DevBlueprint, Rezepte, Daily Dashboard, Mail Classifier

Keine belegte Zahlungsbereitschaft. DevBlueprint ist laut Copy ein MIT-Kit gegen
Lock-in; ein Abo daraus abzuleiten wäre ein neuer Produktwunsch ohne Anforderung.
Daily Dashboard ist `concept` und macOS. Hockey ist kein Produkt in diesem Repo.

## 4. Kleinster Validierungstest ohne Zahlung

Nicht ausgeführt. Kein Analytics-Einbau, keine Bezahlstrecke, kein Live-Shop.

**Portfolio.** Fünf Personen aus den genannten Gruppen — mindestens eine davon kein
Entwickler — öffnen die schon öffentliche Seite oder einen lokalen Lauf und sagen in
einem Satz, wer hier schreibt und welches Projekt sie öffnen würden. Erfolg, vorher
festgelegt: vier von fünf nennen ohne Vorlage das Studium oder ein Projekt und finden
die Mail. Abbruch, wenn die LinkedIn-URL vorher nicht bestätigt ist und der Test sie
benutzen müsste; die Mail reicht.

**fuelivo, nur falls Yannik das andere Repo freigibt.** Eine Person, die Ausdauer
trainiert, erzeugt einen Plan, ohne zu zahlen, und sagt, ob die Zahl brauchbar ist.
Kein Checkout. Nicht von diesem Agenten gegen `fuelivo.de` ausgeführt.

**Aurelian.** Ein Gerätetest braucht macOS bzw. ein iPhone. Hier nicht simulieren.

## 5. Daten, Datenschutz, Betrieb

- Impressum und Datenschutz existieren auf Deutsch und Englisch. Ob der Text zur
  tatsächlichen Verarbeitung passt, ist nicht geprüft.
- Analytics ist optional und aus, solange nicht beide `NEXT_PUBLIC_ANALYTICS_*` gesetzt
  sind (`docs/operations/analytics.md`).
- Fehler-Tracking ist optional über `NEXT_PUBLIC_SENTRY_DSN`
  (`docs/operations/error-monitoring.md`).
- `GITHUB_TOKEN`, Spotify- und WakaTime-Schlüssel sind server-only. Die Seite muss ohne
  sie laufen. Der Heatmap-Fallback ist der vorgesehene Pfad, kein stiller Ausfall, der
  zu verstecken wäre.
- `deploy.yml` publiziert ein Image nach GHCR und rollt nicht aus
  (`docs/operations/deployment.md`). Ob Produktion gesund ist, ist nicht belegt.
- Das Portfolio speichert keine Besucher-Konten. Eine Zahlungs- oder Kontenfunktion
  wäre ein anderes Produkt mit eigenen Pflichten (Vertrag, Speicherort, Löschung) und
  ist nicht vorgeschlagen als nächster Schritt.
- Aurelian-Copy beschreibt einen Server-Endpoint für KI-Generierung und einen API-Key.
  Das ist eine Datenschutz- und Kostenhürde jenes Produkts, nicht dieses Repos.
- macOS-Builds (Daily Dashboard, jede Hockey- oder iOS-App) können hier nicht erzeugt
  oder als grün ausgegeben werden.

## Was dieser Vorschlag nicht ist

Keine Freigabe für P0-2, P0-3, P1-1, P1-2 oder P2-1. Keine neuen Widgets, keine
erfundenen Screenshots, kein Shop, kein SaaS, keine Domain-Entscheidung.

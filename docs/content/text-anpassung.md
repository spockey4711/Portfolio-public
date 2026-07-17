# Text-Anpassung (Arbeitsdatei)

Zweck: Alle sichtbaren Texte der Seite an einer Stelle durchgehen und nach und nach
anpassen. Pro Baustein steht die Quelle (Datei + ungefähre Zeile), der aktuelle Text,
und darunter eine `Neu:`-Zeile.

So arbeitest du damit:

- `Neu:` steht standardmäßig auf **bleibt**. Lass es so, wenn der Text passt.
- Willst du etwas ändern, ersetze `bleibt` durch den neuen Text.
- Ist ein Baustein erledigt (übernommen oder bewusst behalten), hak ihn mit `[x]` ab.
- Zeilennummern sind nur ein Startzeiger und können nach Änderungen leicht verrutschen.

Reihenfolge grob nach Seitenaufbau: Meta/SEO, Navigation, Hero, Terminal, GitHub,
Projekte, Über, Skills, Werdegang, Arbeitsweise, Kontakt, Blog, Footer, Rechtliches.

---

## Meta / SEO

Wird nicht direkt auf der Seite gezeigt, aber in Google-Treffern, Browser-Tab und
Social-Vorschau.

- [ ] **Seitentitel** — `lib/seo/site.ts:18`
  Aktuell: Yannik Wünker - Wirtschaftsinformatik, digitale Produkte & Webentwicklung
  Neu: bleibt

- [ ] **Meta-Beschreibung** — `lib/seo/site.ts:19`
  Aktuell: Portfolio mit Projekten rund um IT, Daten, Backend/Webentwicklung und digitale Produktentwicklung.
  Neu: bleibt

- [ ] **Person / Jobtitel (JSON-LD)** — `lib/seo/site.ts:37`
  Aktuell: Wirtschaftsinformatik-Student
  Neu: bleibt

---

## Navigation

- [ ] **Logo** — `content/copy.ts:17`
  Aktuell: yannik.wuenker
  Neu: bleibt

- [ ] **Nav-Links** — `content/copy.ts:29`
  Aktuell: Projekte · Über · Kontakt
  Neu: bleibt

---

## Hero (oberster Bereich)

- [ ] **Kicker (Zeile über der Überschrift)** — `content/copy.ts:39`
  Aktuell: WIRTSCHAFTSINFORMATIK · SOFTWARE · APPS
  Neu: bleibt

- [ ] **Überschrift H1** — `content/copy.ts:42`
  Aktuell: Ich baue Software, die sich *gut anfühlt.*
  Neu: bleibt

- [ ] **Unterzeile** — `content/copy.ts:45`
  Aktuell: Wirtschaftsinformatik-Student aus Köln. Ich baue Apps, Webprodukte und kleine Systeme, die konkrete Probleme lösen - von Fueling für Ausdauerathleten bis zu Prozessoptimierung mit Python und KI.
  Neu: bleibt

- [ ] **Primärer Button** — `content/copy.ts:47`
  Aktuell: Projekte ansehen
  Neu: bleibt

- [ ] **Verfügbarkeits-Status** — `content/copy.ts:51`
  Aktuell: Verfügbar für Werkstudent
  Neu: bleibt

- [ ] **Now-Playing Label / Fallback-Track** — `content/copy.ts:70`
  Aktuell: // now playing · // last played · Lofi & Commits
  Neu: bleibt

---

## Terminal-Widget

- [ ] **Titelleiste** — `content/copy.ts:83`
  Aktuell: ~/portfolio - zsh
  Neu: bleibt

- [ ] **Intro-Zeile** — `content/copy.ts:90`
  Aktuell: tippe 'help' - probier: whoami, projects, contact, sudo hire-me
  Neu: bleibt

- [ ] **whoami-Antwort** — `content/copy.ts:108`
  Aktuell: yannik.wuenker / Wirtschaftsinformatik-Student aus Köln - Software & Apps. / student · builder · sportler
  Neu: bleibt

- [ ] **skills-Antwort** — `content/copy/de.ts` (`terminal.skills`)
  Aktuell: Überschrift "Skills:" plus Fußzeile; die Gruppen selbst kommen aus `content/skills.ts` (geteilt mit der Skills-Sektion).
  Neu: bleibt

- [ ] **experience-Antwort** — `content/copy/de.ts` (`terminal.experience`)
  Aktuell: Überschrift "Werdegang:", Fußzeile und der "aktuell"-Marker; die Einträge kommen aus `content/experience.ts` (geteilt mit der Werdegang-Sektion).
  Neu: bleibt

- [ ] **contact-Antwort** — `content/copy.ts:120`
  Aktuell: mail@yannikwuenker.de · github.com/spockey4711 · linkedin.com/in/yannik-wuenker
  Neu: bleibt

- [x] **sudo hire-me** — `content/copy/de.ts` (`terminal.hireMe`)
  Aktuell: [sudo] Passwort für recruiter: ... / Prüfe Referenzen ... alles sauber. / Zugriff gewährt. / Schreib mir gerne eine Mail: mail@yannikwuenker.de
  Neu: Verfügbarkeits-Zeile raus (Status bleibt hinter SHOW_AVAILABILITY im Hero); Ablauf poliert mit einer Prüf-Zeile vor der Freigabe

- [ ] **Versteckte Befehle (sudo / sudo rm / ls / coffee)** — `content/copy/de.ts`
  Aktuell: "Netter Versuch..." · `sudo rm -rf /` → sichere Absage · "about/ projects/ ..." · "brewing... ∞ Tassen..."
  Neu: bleibt

---

## GitHub-Aktivität

- [ ] **Zusammenfassung** — `content/copy.ts:148`
  Aktuell: Beiträge im letzten Jahr
  Neu: bleibt

- [ ] **Fallback** — `content/copy.ts:150`
  Aktuell: Aktivität derzeit nicht verfügbar
  Neu: bleibt

---

## Projekte — Rahmen

- [ ] **Intro Projektübersicht** — `content/copy.ts:178`
  Aktuell: Von fertigen Produkten bis zu Experimenten - hier stehen alle Projekte, nicht nur die Highlights vom Onepager.
  Neu: bleibt

---

## Projekte — fuelivo (Hauptprojekt)

- [ ] **Tagline** — `content/projects/fuelivo.ts:11`
  Aktuell: Fueling-Empfehlungen für Ausdauersport - aus wenigen Eingaben eine konkrete Strategie.
  Neu: bleibt

- [ ] **Problem** — `content/projects/fuelivo.ts:15`
  Aktuell: Die meisten Ausdauerathleten wissen nicht, wie sie im Training oder Wettkampf optimal fuelen - Kohlenhydrate, Flüssigkeit, Natrium. Allgemeine Empfehlungen sind zu vage oder nicht auf die Person zugeschnitten.
  Neu: bleibt

- [ ] **Rolle** — `content/projects/fuelivo.ts:17`
  Aktuell: Alles - Idee, Berechnungslogik, Design und technische Umsetzung, mit KI als Entwicklungswerkzeug.
  Neu: bleibt

- [ ] **Stack** — `content/projects/fuelivo.ts:19`
  Aktuell: iOS, Stripe, CI/CD
  Neu: bleibt

- [ ] **Learnings** — `content/projects/fuelivo.ts:20`
  Aktuell: Backend, Frontend und iOS zusammengebracht. / Zahlungen mit Stripe, DNS, CI/CD, Deployment. / Erstes Projekt über ein Python-Skript hinaus.
  Neu: bleibt

---

## Projekte — weitere (nur Tagline)

- [ ] **Rezepte App** — `content/projects/rezepte-app.ts:6`
  Aktuell: App zum Sammeln, Ordnen und Wiederfinden von Rezepten.
  Neu: bleibt

- [x] **Aurelian** (vormals Stoic Daily) — `content/projects/aurelian.ts:9`
  Aktuell: Kurze tägliche Impulse aus der Stoa.
  Neu: Tägliche stoische Reflexion in unter zwei Minuten - auf den echten Tag bezogen.
  (Volle Case Study + Detailseite, Slug `aurelian`, Status `mvp`.)

- [ ] **Daily Dashboard** — `content/projects/daily-dashboard.ts:6`
  Aktuell: Persönliches Dashboard für Coding-Aktivität und den Tag.
  Neu: bleibt

- [ ] **Mail Classifier** — `content/projects/mail-classifier.ts:6`
  Aktuell: Kleines Tool, das eingehende Mails automatisch einsortiert.
  Neu: bleibt

---

## Über mich

- [ ] **Überschrift** — `content/copy.ts:200`
  Aktuell: Zwischen *Produktdenken* und sauberem Code.
  Neu: bleibt

- [ ] **Text Absatz 1** — `content/copy.ts:208`
  Aktuell: Ich studiere Wirtschaftsinformatik in Köln und baue nebenbei die Dinge, die ich selbst gebraucht hätte. Mein bisher größtes Projekt ist fuelivo, eine App, die aus wenigen Eingaben eine konkrete Fueling-Empfehlung für Ausdauersport macht - das erste Mal, dass eins meiner Projekte über ein einzelnes Python-Skript mit README hinausgewachsen ist.
  Neu: bleibt

- [ ] **Text Absatz 2** — `content/copy.ts:209`
  Aktuell: In meiner Freizeit mache ich viel Sport - Hockey, Laufen, Schwimmen und einiges dazwischen. Das prägt, wie ich arbeite: hands-on, technisch, lieber ein Problem sauber lösen als lange darüber reden.
  Neu: bleibt

---

## Skills

- [ ] **Gruppen & Einträge** — `content/skills.ts:14`
  Aktuell: Sprachen & Daten (Python, Java, SQL, D3) · Praxis (App-, Web-Entwicklung, API-Arbeit, Prozessoptimierung) · Werkzeuge & Themen (Git, Excel, KI-Tools, Local AI) · Produkt & Prozess (Prozessanalyse, Produktdenken, Datenmodellierung, Requirements, Dokumentation)
  Neu: bleibt

---

## Werdegang

- [ ] **Studium** — `content/experience.ts:25`
  Aktuell: Wirtschaftsinformatik, Universität zu Köln, seit Oktober 2024 — Datenanalyse, Prozessoptimierung, Softwareentwicklung, Produktmanagement und KI-Anwendungen - mit Fokus darauf, mit KI effizienter zu arbeiten.
  Neu: bleibt

- [ ] **Werkstudent** — `content/experience.ts:34`
  Aktuell: Werkstudent, Institut der deutschen Wirtschaft, seit März 2025 — Arbeit an einem Patentdatenbank-Projekt: Datenanalyse und Prozessoptimierung.
  Neu: bleibt

---

## Wie ich arbeite

- [ ] **Prinzipien** — `content/copy.ts:232`
  Aktuell: Erst das Problem, dann der Code. / Deterministische Logik, wo sie zählt. / Bauen und iterieren statt endlos planen. / Dokumentieren, während ich baue. / KI als Werkzeug, nicht als Krücke.
  Neu: bleibt

---

## Kontakt

- [ ] **Lead-Text** — `content/copy.ts:243`
  Aktuell: Am schnellsten erreichst du mich per Mail - ob Werkstudentenstelle, Projekt oder einfach eine Frage.
  Neu: bleibt

- [ ] **Button** — `content/copy.ts:244`
  Aktuell: Kontakt aufnehmen
  Neu: bleibt

---

## Blog — Rahmen

- [ ] **Titel & Intro Übersicht** — `content/copy.ts:260`
  Aktuell: Notizen — Kein Redaktionsplan - hier stehen Notizen zu Dingen, die ich gebaut habe und die eine Erklärung wert sind.
  Neu: bleibt

- [ ] **Leerer Blog** — `content/copy.ts:265`
  Aktuell: Noch kein Beitrag - der erste entsteht, sobald ich etwas gebaut habe, das eine Erklärung wert ist.
  Neu: bleibt

---

## Blog — Beitrag "Warum dieses Portfolio kein Baukasten ist"

Ganzer Beitrag in `content/blog/warum-dieses-portfolio.mdx`.

- [ ] **Titel & Summary (Frontmatter)** — `content/blog/warum-dieses-portfolio.mdx:2`
  Aktuell: Warum dieses Portfolio kein Baukasten ist / Ein kurzer Blick hinter die Kulissen: warum ich diese Seite von Hand gebaut habe...
  Neu: bleibt

- [ ] **Fließtext des Beitrags** — `content/blog/warum-dieses-portfolio.mdx:8` ff.
  Aktuell: (kompletter Artikel, ab "Die schnellste Art, ein Portfolio zu bauen...")
  Neu: bleibt

---

## Jetzt (Now-Seite)

Die `/jetzt`-Seite ist eine Momentaufnahme und soll oft aktualisiert werden. Alles steht
in `content/now.ts`: Abschnitte in `sections` anpassen, danach `lastUpdated` (das
"Stand"-Datum) hochsetzen - mehr braucht es nicht.

- [ ] **Titel & Intro** — `content/now.ts` (`title`, `intro`)
  Aktuell: Woran ich gerade arbeite / kurze Momentaufnahme des aktuellen Fokus
  Neu: bleibt

- [ ] **Abschnitte (baue / lerne / lese)** — `content/now.ts` (`sections`)
  Aktuell: Woran ich gerade baue · Was ich gerade lerne · Was ich gerade lese
  Neu: bleibt

- [ ] **Stand-Datum** — `content/now.ts` (`lastUpdated`)
  Aktuell: Juli 2026
  Neu: bleibt

---

## Footer

- [ ] **Name** — `content/copy.ts:279`
  Aktuell: Yannik Wünker
  Neu: bleibt

- [ ] **Explore-Links** — `content/copy/de.ts` (`footer.explore.links`)
  Aktuell: Jetzt · Blog
  Neu: bleibt

---

## Rechtliches (Impressum & Datenschutz)

Meist Standardtext, aber deine Daten drin. Prüfen: Anschrift, Name, E-Mail, Hoster.

- [ ] **Rechtliche Entität (Name / Anschrift / E-Mail)** — `content/legal.ts:44`
  Aktuell: Yannik Wünker, Lövenicher Weg 2b, 50933 Köln, Deutschland, mail@yannikwuenker.de
  Neu: bleibt

- [ ] **Hosting-Provider** — `content/legal.ts:58`
  Aktuell: Contabo GmbH, Aschauer Straße 32a, 81549 München, Deutschland
  Neu: bleibt

- [ ] **Stand-Datum (beide Seiten)** — `content/legal.ts:85` / `:132`
  Aktuell: Juli 2026
  Neu: bleibt

- [ ] **Datenschutz-Intro** — `content/legal.ts:130`
  Aktuell: Diese Website ist ein privates Portfolio. Ich verarbeite so wenige personenbezogene Daten wie möglich...
  Neu: bleibt

- [ ] **Impressum-Textbausteine (Haftung, Urheberrecht, ...)** — `content/legal.ts:82` ff.
  Aktuell: Standard-Rechtstexte
  Neu: bleibt

- [ ] **Datenschutz-Textbausteine (Logfiles, Cookies, Rechte, ...)** — `content/legal.ts:127` ff.
  Aktuell: Standard-Rechtstexte
  Neu: bleibt

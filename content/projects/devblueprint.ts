import type { Project } from "./types";

/**
 * DevBlueprint - ein wiederverwendbares, stack-agnostisches Engineering-Setup
 * für neue Projekte. Das dritte Projekt mit voller `caseStudy`, gezogen aus dem
 * eigenen (öffentlichen, MIT-lizenzierten) Repository; die flachen Felder
 * (tagline, problem, role, links) speisen die Onepager-Karte und den Index. Als
 * Kommandozeilen-Kit hat es keinen Produkt-Screenshot, daher greift ein bewusst
 * gestalteter, generierter Marken-Platzhalter als Cover (scripts/generate-assets.mjs).
 * Siehe docs/content/projects.md.
 */
export const devblueprint: Project = {
  slug: "devblueprint",
  name: "DevBlueprint",
  tagline:
    "Ein wiederverwendbares Engineering-Setup für neue Projekte - professioneller Prozess ab Commit eins, ganz ohne Lock-in.",
  status: "live",
  kind: "cli",
  year: 2026,
  order: 3,
  problem:
    "Jedes neue Projekt startet ohne Prozess: Git-Workflow, Quality Gate, Konventionen und KI-Leitplanken werden jedes Mal neu erfunden oder ganz weggelassen - gerade im Solo-Betrieb. Mit mehreren parallelen KI-Sessions kommt ein zweites Problem dazu: die Chats wechseln sich gegenseitig den Branch weg. Fertige Frameworks und Template-Repos lösen das nur um den Preis dauerhafter Bindung.",
  role: "Alles - die Idee, die Extraktion des Prozesses aus einem echten Produktiv-Codebase, die stack-agnostische Kern-Doku, die Bash-CLI, die neun Stack-Varianten, das Bats-Test-Setup und die Agent-Integration (CLAUDE.md, --json, Setup-Skill).",
  onepager: {
    statement:
      "Der Kern bleibt stack-agnostisch; duenne Varianten ergaenzen nur Gate, CI und Setup fuer den jeweiligen Stack.",
    stack: ["Bash", "bats", "GitHub Actions", "Markdown"],
  },
  learnings: [
    "Ein wiederverwendbares Setup darf kein Framework sein: dokumentations-first, reine Dateien und kein Runtime schlagen jedes Template-Repo, weil das Projekt Eigentümer bleibt und nichts an DevBlueprint gebunden ist.",
    "Der Worktree-pro-Task-Ansatz ist der Punkt, an dem parallele KI-Sessions aufhören, sich gegenseitig den Branch wegzuziehen - ein einziges wt-Skript trägt den ganzen Workflow.",
    "Einen gemeinsamen Kern von dünnen Stack-Overlays zu trennen (core/ vs. variants/) hält neun Stacks wartbar: den Prozess ändert man an einer Stelle, nur das Stack-Spezifische liegt je Variante.",
    "Damit ein Agent ein Werkzeug bedienen kann, braucht es maschinenlesbaren Zustand (--json) und einen Dry-Run (plan == init --dry-run) - erst dann kann er vor dem Schreiben verlässlich bestätigen.",
    "Das eigene Setup auf sich selbst anzuwenden (Dogfooding) hat die Lücken am schnellsten gezeigt.",
  ],
  links: { repo: "https://github.com/spockey4711/DevBlueprint" },
  media: { cover: "/images/devblueprint_terminal.png" },
  detailPage: true,
  caseStudy: {
    summary:
      "DevBlueprint ist ein wiederverwendbares Engineering-Setup für neue Projekte, extrahiert aus einem echten Produktiv-Codebase und stack-agnostisch gemacht. Ein Befehl scaffoldet Git-Workflow, Quality Gate, Code-Konventionen und KI-Assistenten-Leitplanken in ein Zielverzeichnis. Dokumentations-first: die Ausgabe sind reine Dateien, die man besitzt und editiert - kein Runtime, kein Lock-in. Man kann DevBlueprint danach löschen, und nichts bricht.",
    solution: {
      intro:
        "DevBlueprint trennt einen stack-agnostischen Kern von dünnen Stack-Overlays. core/ hält die Quelle der Wahrheit - Git-Workflow, Engineering-Standards, Konventionen, Quality-and-Testing und die CLAUDE.md-Templates. Neun Varianten fügen nur das Stack-Spezifische hinzu: die konkreten Gate-Befehle, einen CI-Workflow, .gitignore und die Worktree-Konfiguration. Eine Bash-CLI scaffoldet, prüft und aktualisiert das Setup.",
      highlights: [
        "Zwei langlebige Branches (develop -> master) und ein Worktree pro Task über ein einziges wt-Skript - mehrere KI-Sessions arbeiten parallel, ohne sich je den Branch zu wechseln.",
        "Ein Quality Gate aus lint, typecheck, test und build, an den Stack verdrahtet und lokal (Pre-commit) wie in CI (GitHub Actions) erzwungen.",
        "Neun Stack-Varianten - von web-nextjs und ios-swift über backend-go und rust bis zum generischen Makefile-Gate - jede mit passendem Gate, CI und setup.sh.",
        "Overwrite-sicheres init fügt den Workflow auch einem bestehenden Repo hinzu, ohne Code zu überschreiben; update zieht spätere Kern-Verbesserungen nach, ohne CLAUDE.md, CI oder Code anzufassen.",
        "Von einem Agenten bedienbar: --json-Ausgabe, eine intake.yml plus plan (== init --dry-run) und ein /devblueprint-setup-Skill, der interviewt, plant und erst nach Bestätigung scaffoldet.",
      ],
    },
    features: [
      { label: "Zwei-Branch-Workflow mit Worktree pro Task", status: "done" },
      { label: "Quality Gate lokal (Pre-commit) und in CI", status: "done" },
      { label: "Neun Stack-Varianten", status: "done" },
      { label: "CLI: list, init, plan, update, doctor, detect, version", status: "done" },
      { label: "Overwrite-sicheres init für bestehende Repos", status: "done" },
      { label: "update re-synct nur die Kern-Dateien", status: "done" },
      { label: "detect erkennt den Stack per Fingerprint", status: "done" },
      { label: "Intake-Datei + plan (Dry-Run-Vorschau)", status: "done" },
      { label: "Maschinenlesbare --json-Ausgabe", status: "done" },
      { label: "Agent-Setup-Skill (/devblueprint-setup)", status: "done" },
      { label: "doctor --strict und --run-gate", status: "done" },
      { label: "Optionale Community-Health-Dateien (--community)", status: "done" },
    ],
    techStack: [
      {
        name: "CLI & Kern",
        items: ["Bash", "POSIX-Shell", "0 Runtime-Abhängigkeiten", "{{TOKENS}}-Templates"],
      },
      {
        name: "Stack-Varianten",
        items: [
          "web-nextjs",
          "backend-python",
          "backend-go",
          "node-express",
          "ios-swift",
          "android-kotlin",
          "data-python",
          "rust",
          "generic",
        ],
      },
      {
        name: "Prozess & Doku",
        items: ["Git-Worktrees", "Conventional Commits", "Keep a Changelog", "Markdown-Doku"],
      },
      {
        name: "Automatisierung",
        items: ["GitHub Actions", "Pre-commit-Hooks", "Makefile-Gate", "setup.sh"],
      },
      {
        name: "Agent-Integration",
        items: ["CLAUDE.md", "Claude Code Skill", "--json", "intake.yml"],
      },
      {
        name: "Qualität",
        items: ["bats", "13 Test-Dateien", "~875 Zeilen Bats-Tests"],
      },
    ],
    architecture: {
      intro:
        "core/ ist die stack-agnostische Quelle der Wahrheit und wird in jedes Projekt kopiert; variants/ overlayen nur das Stack-Spezifische. Die Ausgabe sind reine Dateien im Zielprojekt - es gibt keinen Runtime und keine Abhängigkeit auf DevBlueprint selbst.",
      points: [
        "core/ hält den agnostischen Kern (Git-Workflow, Standards, Konventionen, Quality-and-Testing, CLAUDE.md-Templates); eine Variante fügt nur Gate-Befehle, CI, .gitignore und wt.conf hinzu.",
        "init ist overwrite-sicher - es überschreibt ohne --force keine bestehende Datei, lässt sich also auf ein bestehendes Repo anwenden.",
        "update re-synct gezielt nur die core-owned Dateien und fasst CLAUDE.md, wt.conf, CI und Code nie an - Kern-Verbesserungen erreichen alte Projekte, ohne ihre Anpassungen zu zerstören.",
        "plan ist exakt init --dry-run - dieselbe Code-Bahn mit kurzgeschlossenen Schreibzugriffen, sodass die Vorschau nie von der echten Ausgabe abweichen kann.",
        "Jede Ausgabe ist eine reine Datei, die das Zielprojekt besitzt - kein Framework, keine Bindung; DevBlueprint kann danach gelöscht werden.",
      ],
    },
    challenges: [
      {
        title: "Wiederverwendbarkeit ohne Lock-in",
        problem:
          "Ein geteiltes Setup als Framework oder Template-Repo bindet jedes Projekt dauerhaft an sich - Updates werden zur Abhängigkeit, Abweichungen zum Kampf gegen das Werkzeug.",
        solution:
          "Dokumentations-first: die Ausgabe sind reine Dateien, die das Projekt besitzt und frei editiert. Es gibt keinen Runtime; nach dem Scaffolding kann DevBlueprint gelöscht werden, ohne dass etwas bricht.",
      },
      {
        title: "Parallele KI-Sessions ohne Branch-Kollision",
        problem:
          "Mehrere Assistenten-Chats an einem Repo wechseln sich gegenseitig den Branch weg - Arbeit landet auf dem falschen Stand oder geht verloren.",
        solution:
          "Ein Worktree pro Task über ein einziges wt-Skript: jede Aufgabe bekommt ihr eigenes Verzeichnis mit eigenem Branch (von develop), der Haupt-Klon bleibt auf master. Sessions kollidieren nicht mehr.",
      },
      {
        title: "Ein Workflow, viele Stacks",
        problem:
          "Der Prozess soll überall gleich sein, aber die konkreten Quality-Gate-Befehle, CI und Ignorierregeln unterscheiden sich je nach Stack fundamental.",
        solution:
          "core/ hält den agnostischen Kern, variants/ overlayen nur das Stack-Spezifische. Eine neue Variante entsteht, indem man einen Ordner kopiert und Gate, wt.conf und CI anpasst - sie taucht danach automatisch in devblueprint list auf.",
      },
      {
        title: "Von einem Agenten bedienbar",
        problem:
          "Eine Text-CLI ist für Menschen gebaut; ein Agent muss den Zustand zuverlässig parsen und vor jedem Schreibzugriff bestätigen können.",
        solution:
          "list, doctor und version liefern --json (doctor exitet weiterhin bei Fehlern non-zero), eine intake.yml plus plan (== init --dry-run) zeigt exakt die geplante Ausgabe, und ein /devblueprint-setup-Skill interviewt, schreibt die Intake-Datei und scaffoldet erst nach Bestätigung.",
      },
    ],
    metrics: [
      { value: "9", label: "Stack-Varianten" },
      { value: "7", label: "CLI-Befehle" },
      { value: "~1.500", label: "Zeilen Shell" },
      { value: "13", label: "Bats-Test-Dateien" },
      { value: "117", label: "Commits" },
      { value: "0", label: "Runtime-Abhängigkeiten" },
    ],
    timeline: [
      {
        period: "Mai 2026",
        title: "Fundament",
        description:
          "Begonnen als Agenten-Projekt-Kit mit CLI-Gerüst, erster Doku und CI. Fünf Commits legen die Basis, bevor das Konzept überarbeitet wird.",
      },
      {
        period: "7. Juli 2026",
        title: "Neuausrichtung & Ausbau",
        description:
          "In einem konzentrierten Arbeitstag zum dokumentations-first Engineering-Kit umgebaut: Kern-Doku, der Worktree-basierte Workflow, neun Stack-Varianten, die CLI-Befehle (detect, --json, intake + plan, update), die Bats-Test-Suite und der Agent-Setup-Skill. 112 der 117 Commits fallen auf diesen Tag - inklusive Dogfooding des Setups auf dem eigenen Repo.",
      },
    ],
  },
};

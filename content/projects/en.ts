/**
 * English overrides for the project content. German (the per-project files) is the
 * canonical base and stays untouched; this file supplies only the translatable
 * fields, keyed by slug, and getProjects("en") merges them onto the base (see
 * ./index.ts). Locale-invariant fields - slug, order, status, links and media -
 * are never duplicated here, so they cannot drift. See docs/content/i18n.md.
 *
 * Card-level fields (name, tagline, problem, role, learnings) feed the English
 * onepager and projects index. The long-form `caseStudy` prose is translated for
 * the English project detail route (S5-1b): a `CaseStudyOverride` carries the
 * translated prose and `mergeCaseStudy` (in ./index.ts) overlays it onto the
 * German base. Only three facts are inherited from the base - each feature's
 * `status`, each screenshot's `src` and the `interactiveProof` flag - because
 * those are the only truly locale-invariant parts (the same image file serves
 * both languages). The tech stack is translated (its layer names and
 * descriptive items are German prose) and so are the metric values (German uses
 * "." as the thousands separator, e.g. "16.100" -> "16,100").
 */

import type { Project, ProjectChallenge, ProjectMetric, TechLayer, TimelinePhase } from "./types";

/**
 * The translatable half of a project's `caseStudy`. A feature override carries
 * only its `label` (and optional `tag`); its `status` is overlaid from the German
 * base, so it is not repeated here. A screenshot override works the same way: it
 * translates `alt` and `caption` and inherits `src`, which points at one image
 * file shared by both languages. The fully translated lists (tech stack,
 * challenges, metrics, timeline) replace the base wholesale.
 */
export interface CaseStudyOverride {
  summary?: string;
  solution?: { intro?: string; highlights?: string[] };
  features?: { label: string; tag?: string }[];
  screenshots?: { alt: string; caption: string }[];
  techStack?: TechLayer[];
  architecture?: { intro?: string; points?: string[] };
  challenges?: ProjectChallenge[];
  metrics?: ProjectMetric[];
  timeline?: TimelinePhase[];
}

/** The translatable subset of a Project, all optional (a lean entry has only a tagline). */
export type ProjectContentOverride = Partial<
  Pick<Project, "name" | "tagline" | "problem" | "role" | "learnings" | "onepager">
> & { caseStudy?: CaseStudyOverride };

export const enProjectContent: Record<string, ProjectContentOverride> = {
  fuelivo: {
    tagline: "Fueling for endurance athletes - concrete strategies from a few inputs.",
    problem:
      "Endurance athletes have to take in carbohydrates, fluid and electrolytes deliberately in training and competition - too little causes a performance drop, too much or the wrong thing causes GI trouble. The right amount depends on many factors at once: duration, intensity, sport, heat, gut tolerance. Blanket rules of thumb like '60 g of carbs per hour' ignore that, generic nutrition apps track daily balances instead of sessions, and AI coaches hand out recommendations you can't reason about.",
    role: "Everything - the idea, domain research, the calculation logic, design, backend, web frontend and the native iOS app. AI was a development tool here, not an autopilot.",
    onepager: {
      statement:
        "The right fueling depends on duration, intensity, sport, heat and tolerance - blanket grams-per-hour rules fall short.",
    },
    learnings: [
      "For the first time I combined a backend, a web frontend and a native iOS app in one project. The clean layering paid off with the second client: the logic was reusable, only the transport layer was new.",
      "Payments across two worlds - Stripe on the web and Apple StoreKit on iOS - behind a single entitlement service: one source of truth for feature flags.",
      "A versioned mobile API with OpenAPI and a contract check in CI is the point where 'backend and app drift apart' stops being a problem.",
      "The first project that grew beyond a single Python script with a README - including its own domain, DNS, CI/CD and deployment.",
      "Next time: one clear deployment path instead of Docker and Vercel in parallel, and shared types between backend and iOS earlier.",
    ],
    caseStudy: {
      summary:
        "fuelivo is a rule-based calculator for sports nutrition. Endurance athletes and coaches enter session parameters - weight, duration, intensity, sport, conditions - and get concrete carbohydrate, sodium and fluid targets in g, ml and mg, split across before, during and after the session. The recommendations are deliberately deterministic: no black box, every output carries its reasoning and warnings. A backend, a web app and a native iOS app share the same logic.",
      solution: {
        intro:
          "fuelivo models published sports-nutrition heuristics as a deterministic rule engine. For each session it computes per-hour targets, scales them to the full duration and translates them into concrete products - drink, gel, bar, banana. Every calculation step produces a plain-language reason, and edge cases raise warnings. It positions itself deliberately as a sports-science calculator, not an AI coach.",
        highlights: [
          "Carbohydrates per hour: a base value from the duration plus additive modifiers for intensity, sport and heat, capped by a tolerance matrix of gut sensitivity and gut training.",
          "Fluid and sodium per hour, depending on intensity and sport, optionally overridden by a measured sweat rate.",
          "Three phases: carb-loading beforehand, timed intake during, recovery with protein afterwards - plus a race schedule with aid-station timing.",
          "The total amount is translated into ready-to-buy products: depending on aid-station access, a plain drink, drink plus gel or a real-food mix.",
          "Separate engines for gym training and race day, because their calculation models are fundamentally different - kept apart for independent maintainability.",
        ],
      },
      features: [
        { label: "Public calculator, no login required" },
        { label: "Transparent reasoning and warnings" },
        { label: "Three-phase recommendation (before, during, after)" },
        { label: "Concrete product options per phase", tag: "Pro" },
        { label: "Race plan with aid-station timing", tag: "Pro" },
        { label: "Gym and strength calculator" },
        { label: "Athlete dashboard with history", tag: "Pro" },
        { label: "Coach portal with roster and templates", tag: "Coach" },
        { label: "Auth, Google OAuth and Sign in with Apple" },
        { label: "Stripe and Apple StoreKit subscriptions" },
        { label: "i18n German/English" },
        { label: "Native iOS app" },
      ],
      techStack: [
        {
          name: "Backend",
          items: ["Python 3.11", "FastAPI", "SQLAlchemy 2 (async)", "Alembic", "Jinja2", "PyJWT"],
        },
        {
          name: "Web frontend",
          items: ["React 18", "React Router", "Vite", "Tailwind CSS", "i18next", "React Email"],
        },
        {
          name: "iOS",
          items: [
            "SwiftUI",
            "Custom design system",
            "StoreKit",
            "Sign in with Apple",
            "xcconfig environments",
          ],
        },
        {
          name: "Data & infrastructure",
          items: [
            "PostgreSQL (Neon)",
            "Repository pattern",
            "Docker Compose",
            "GitHub Actions",
            "Vercel",
          ],
        },
        {
          name: "Payments & operations",
          items: ["Stripe", "Apple StoreKit", "Entitlement service", "Resend", "PostHog", "Sentry"],
        },
        {
          name: "Quality",
          items: ["pytest", "Playwright", "xcodebuild", "OpenAPI contract check", "5 CI workflows"],
        },
      ],
      architecture: {
        intro:
          "FastAPI serves a Jinja2 shell that loads the built React SPA and injects auth and entitlement state straight into the HTML - no extra round trip. The iOS app talks to the same domain logic over a dedicated, versioned mobile API. Inside, it is Route -> Service -> Repository throughout.",
        points: [
          "Route -> Service -> Repository: thin routes, business logic testable in isolation, reused for the second client.",
          "Calculation rows are append-only - an immutable audit trail instead of mutated records.",
          "State-mutating POSTs are protected with a double-submit CSRF token.",
          "Sentry, PostHog and the database are fail-open: missing config never blocks a local start.",
          "A contract check in CI stops the backend and the iOS app from drifting apart.",
        ],
      },
      challenges: [
        {
          title: "Migrating the core formula without distorting results",
          problem:
            "The original multiplicative model was to be replaced by a more transparent additive matrix model - without recommendations shifting unnoticed.",
          solution:
            "Both modes stay in the code, switchable by an env flag, with a shadow-compare mode for side-by-side comparison. The switch was low-risk and the old logic stays reproducible.",
        },
        {
          title: "One entitlement model across two payment worlds",
          problem:
            "Pro access can exist via Stripe on the web or via Apple StoreKit on iOS. Routes must never check payment status directly.",
          solution:
            "A central entitlement service resolves Free, Pro and Coach across both providers - a single source of truth for feature flags.",
        },
        {
          title: "Keeping the backend and the native iOS app in sync",
          problem:
            "Two clients on one API: contract breaks otherwise surface late, and on the user.",
          solution:
            "A dedicated, versioned mobile API with an OpenAPI spec and its own contract-check workflow. Drift is caught in the pull request already.",
        },
        {
          title: "The swimming special case",
          problem:
            "A gel or bar during the session is impractical in the pool - generic fueling makes no sense.",
          solution:
            "A dedicated pool-bottle logic with carbohydrate powder and an electrolyte tablet, including sip timing at the wall, plus an electrolyte warning.",
        },
      ],
      metrics: [
        { value: "3", label: "Platforms (backend, web, iOS)" },
        { value: "~16,100", label: "Lines of Python (backend)" },
        { value: "~17,200", label: "Lines of Swift (iOS)" },
        { value: "269", label: "Commits" },
        { value: "13", label: "Database tables" },
        { value: "5", label: "CI workflows" },
      ],
      timeline: [
        {
          period: "March 2026",
          title: "Foundation",
          description:
            "In a few weeks the calculation engine, web SPA, auth, billing and coach portal take shape - 257 of the 269 commits fall in this month.",
        },
        {
          period: "Late March",
          title: "Maturity",
          description:
            "CI workflows, the OpenAPI contract check, documentation and the new matrix calculation model alongside the legacy formula.",
        },
        {
          period: "April - May",
          title: "iOS & billing",
          description:
            "Native SwiftUI app, i18n and accessibility, Apple StoreKit subscriptions and the unified entitlement resolution across Stripe and Apple.",
        },
        {
          period: "June",
          title: "Polish",
          description:
            "Adjusting the fueling duration limits and final polish; the last commit lands on 17 June 2026.",
        },
      ],
    },
  },
  aurelian: {
    onepager: {
      statement:
        "Quotes stay in a vetted local database; AI may select one, but it can never invent one.",
      stack: ["SwiftUI", "Swift 6", "SwiftData", "Node.js"],
    },
    tagline: "Daily stoic reflection in under two minutes - grounded in your actual day.",
    problem:
      "Stoicism apps serve generic quotes with no bearing on everyday life, journaling apps demand too much input and feel like work, and AI reflection tools invent quotes - with philosophical sources that destroys credibility instantly. Ambitious users want a short, practical moment of clarity before the day: no to-do list, no coach tone, no made-up wisdom.",
    role: "Everything end-to-end - product definition and PRD, a modular local-first architecture, the SwiftUI frontend, domain and application logic as a Swift package, curating the vetted quote database, the hardened Node backend endpoint for the AI generation, plus deployment, App Store preparation and test strategy.",
    learnings: [
      "A port-based, modular architecture keeps product rules testable independently of SwiftUI and SwiftData - the domain layer depends on nothing and can be checked without an iOS simulator.",
      "Quote hallucinations are not a prompt problem but an architecture problem: solved with a deterministic selection policy that hands the AI only permitted candidates - the AI picks, it never invents.",
      "Moving generation from the client to a stateless server endpoint protects the API key, caps the cost (one output per user per day) and still allows a local offline fallback.",
      "Text-input latency on iOS is real: a dedicated investigation and buffering of the input kept the Today screen smooth.",
    ],
    caseStudy: {
      summary:
        "Aurelian helps you align your day, stoically, in under two minutes. The app combines a personal 12-week focus goal, the day's most important tasks, your current energy level and vetted stoic quotes into a short, concrete daily reflection. Deliberately not another quote-of-the-day app, but a stoic perspective on the user's actual day - calm and grown-up in tone, without motivational platitudes.",
      solution: {
        intro:
          "The core is a very short daily loop. In the morning the user enters one to three important things, optionally adds what is on their mind, and picks their energy level; from that Aurelian generates a stoic perspective and a concrete rule for the day. In the evening, two or three short questions follow. The output is strictly structured, and the AI only ever selects from vetted, locally supplied quote candidates.",
        highlights: [
          "Fixed output structure: quote, source, today's perspective, a control question, a rule for the day, an evening question - short and concrete instead of a motivational speech.",
          "The AI references exactly one quote ID from the supplied candidates and may never invent quotes, sources or authors.",
          "Morning check-in in under two minutes: priorities, optional free text, energy level (Low / Normal / High).",
          "Evening reflection deliberately short: three questions, three minutes at most, no pressure to analyze - stored locally.",
          "Offline fallback: if no AI endpoint is configured or reachable, the app keeps generating locally.",
        ],
      },
      features: [
        { label: "Minimal onboarding (max. 4 screens)" },
        { label: "Morning check-in (priorities, free text, energy)" },
        { label: "Structured stoic output" },
        { label: "Vetted quote database with provenance" },
        { label: "Evening reflection (three short questions)" },
        { label: "Journal / history with detail view" },
        { label: "Local reminder notifications" },
        { label: "Offline fallback without an AI endpoint" },
        { label: "Remote generation via a Groq endpoint" },
        { label: "Favorites and an editable focus goal", tag: "V0.2" },
        { label: "Weekly review", tag: "V0.3" },
        { label: "Paywall, export (PDF/Markdown), Life Wheel", tag: "V1.0" },
      ],
      techStack: [
        {
          name: "iOS app",
          items: ["SwiftUI", "SwiftData", "UserDefaults", "UserNotifications", "XcodeGen"],
        },
        {
          name: "Core (Swift package)",
          items: ["Swift 6", "Swift Package Manager", "5 modular library targets"],
        },
        {
          name: "Backend / AI",
          items: ["Node.js", "Stateless endpoint", "Groq (LLM)", "Structured Outputs"],
        },
        {
          name: "Operations & compliance",
          items: [
            "Fixed-window rate limiting",
            "Server-side API key",
            "Static public site",
            "App Store signing",
          ],
        },
        {
          name: "Quality",
          items: ["26 test files", "5 test targets", "iOS unit & UI tests", "iOS E2E"],
        },
      ],
      architecture: {
        intro:
          "Local-first and modular, with clear boundaries between product rules and technical details (UI, persistence, notifications, AI provider). A platform-independent Swift package is cut into five library targets (Domain, Application, Content, Infrastructure, Design); the SwiftUI app composes them. Clear boundaries are preferred over heavy abstractions.",
        points: [
          "Dependency direction: apps/ios -> Application -> Domain; the domain layer depends on nothing - no UI, no persistence, no network, no AI SDK.",
          "The AI is an adapter behind the Application contract DailyReflectionGeneratorPort: it receives user context plus quote candidates and returns structured output that references exactly one quote ID.",
          "Core ports decouple the outside world: DailyEntryRepository, FocusGoalRepository, UserPreferencesRepository, QuoteRepository, Clock, IDGenerator.",
          "Content -> Domain and Infrastructure -> Content: the vetted quote dataset lives behind a QuoteRepository, not scattered through the UI code.",
          "Generation runs over a stateless Node endpoint with a server-side key; if it fails, the local fallback takes over without breaking the user's flow.",
        ],
      },
      challenges: [
        {
          title: "Preventing quote hallucinations",
          problem:
            "The central trust question: if the AI invents quotes, authors or sources, that instantly destroys credibility for philosophical texts.",
          solution:
            "A vetted local database plus a deterministic QuoteSelectionPolicy hands the AI only permitted candidates. The AI picks exactly one ID but never invents - provenance (author, work, reference) stays guaranteed real.",
        },
        {
          title: "AI sounds generic",
          problem:
            "Standard prompts produce interchangeable motivational lines with no bearing on the user's actual day.",
          solution:
            "A very strict prompt with real daily data in context and short, concrete outputs instead of motivational speeches - a stoic perspective on this exact day.",
        },
        {
          title: "API-key protection and cost",
          problem:
            "Direct in-app calls to the LLM provider expose the key and make costs uncontrollable.",
          solution:
            "Moving generation to a stateless server endpoint with a server-side key, fixed-window rate limiting, limited retries and exactly one output per user per day.",
        },
        {
          title: "Testability despite iOS dependencies",
          problem:
            "SwiftUI and SwiftData are hard to test in isolation - product rules risk being chained to the UI framework.",
          solution:
            "The modular, port-based architecture keeps domain and application logic independent of SwiftUI/SwiftData and thus testable across more than 26 test files in five test targets.",
        },
      ],
      metrics: [
        { value: "~4,500", label: "Lines of Swift code" },
        { value: "~85", label: "Swift files" },
        { value: "5", label: "modular package targets" },
        { value: "80", label: "vetted quotes" },
        { value: "26", label: "test files" },
        { value: "1", label: "production AI endpoint" },
      ],
      timeline: [
        {
          period: "29 April 2026",
          title: "Foundation in a day",
          description:
            "Domain package, content validation, daily-entry rules, design tokens, first application use cases (onboarding, morning check-in), SwiftData repositories and a SwiftUI app shell with onboarding, check-in, journal and focus wired up.",
        },
        {
          period: "30 April - 1 May",
          title: "Persistence & quote policy",
          description:
            "Deeper persistence, extended onboarding and journal detail; then the deterministic quote-selection policy, the catalog expansion, the decision for Groq, a remote reflection adapter, the local notification scheduler and first tests.",
        },
        {
          period: "2 May",
          title: "Endpoint live & E2E",
          description:
            "Stateless Groq endpoint implemented, hardened, deployed to production and validated by iOS E2E; plus App Store signing, shell assets and the public marketing, privacy and support pages.",
        },
        {
          period: "3 May",
          title: "Compliance & polish",
          description:
            "App Store compliance answers, a store-metadata draft, polishing the accessibility copy and buffering the text inputs. Status since: Client MVP Ready / App Store Release Prep.",
        },
      ],
    },
  },
  devblueprint: {
    onepager: {
      statement:
        "The core stays stack-agnostic; thin variants add only the gate, CI and setup for each stack.",
      stack: ["Bash", "bats", "GitHub Actions", "Markdown"],
    },
    tagline:
      "A reusable engineering setup for new projects - a professional process from commit one, with no lock-in.",
    problem:
      "Every new project starts without a process: the git workflow, quality gate, conventions and AI guardrails get reinvented every time or skipped entirely - especially solo. Running several AI sessions in parallel adds a second problem: the chats keep switching each other's branch. Ready-made frameworks and template repos only solve it at the price of permanent lock-in.",
    role: "Everything - the idea, extracting the process from a real production codebase, the stack-agnostic core docs, the Bash CLI, the nine stack variants, the bats test setup and the agent integration (CLAUDE.md, --json, setup skill).",
    learnings: [
      "A reusable setup must not be a framework: documentation-first, plain files and no runtime beat any template repo, because the project stays the owner and nothing is tied to DevBlueprint.",
      "The worktree-per-task approach is the point where parallel AI sessions stop pulling each other's branch out from under them - a single wt script carries the whole workflow.",
      "Separating a shared core from thin stack overlays (core/ vs. variants/) keeps nine stacks maintainable: you change the process in one place, and only the stack-specific bits live per variant.",
      "For an agent to operate a tool it needs machine-readable state (--json) and a dry run (plan == init --dry-run) - only then can it confirm reliably before writing.",
      "Applying the setup to itself (dogfooding) surfaced the gaps fastest.",
    ],
    caseStudy: {
      summary:
        "DevBlueprint is a reusable engineering setup for new projects, extracted from a real production codebase and made stack-agnostic. One command scaffolds the git workflow, quality gate, code conventions and AI-assistant guardrails into a target directory. Documentation-first: the output is plain files you own and edit - no runtime, no lock-in. You can delete DevBlueprint afterwards, and nothing breaks.",
      solution: {
        intro:
          "DevBlueprint separates a stack-agnostic core from thin stack overlays. core/ holds the source of truth - the git workflow, engineering standards, conventions, quality-and-testing and the CLAUDE.md templates. Nine variants add only the stack-specific parts: the concrete gate commands, a CI workflow, .gitignore and the worktree configuration. A Bash CLI scaffolds, checks and updates the setup.",
        highlights: [
          "Two long-lived branches (develop -> master) and one worktree per task via a single wt script - several AI sessions work in parallel without ever switching each other's branch.",
          "A quality gate of lint, typecheck, test and build, wired to the stack and enforced locally (pre-commit) as well as in CI (GitHub Actions).",
          "Nine stack variants - from web-nextjs and ios-swift through backend-go and rust to the generic Makefile gate - each with a matching gate, CI and setup.sh.",
          "Overwrite-safe init adds the workflow to an existing repo too, without overwriting code; update pulls in later core improvements without touching CLAUDE.md, CI or code.",
          "Operable by an agent: --json output, an intake.yml plus plan (== init --dry-run) and a /devblueprint-setup skill that interviews, plans and scaffolds only after confirmation.",
        ],
      },
      features: [
        { label: "Two-branch workflow with one worktree per task" },
        { label: "Quality gate locally (pre-commit) and in CI" },
        { label: "Nine stack variants" },
        { label: "CLI: list, init, plan, update, doctor, detect, version" },
        { label: "Overwrite-safe init for existing repos" },
        { label: "update re-syncs only the core files" },
        { label: "detect identifies the stack by fingerprint" },
        { label: "Intake file + plan (dry-run preview)" },
        { label: "Machine-readable --json output" },
        { label: "Agent setup skill (/devblueprint-setup)" },
        { label: "doctor --strict and --run-gate" },
        { label: "Optional community-health files (--community)" },
      ],
      techStack: [
        {
          name: "CLI & core",
          items: ["Bash", "POSIX shell", "0 runtime dependencies", "{{TOKENS}} templates"],
        },
        {
          name: "Stack variants",
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
          name: "Process & docs",
          items: ["Git worktrees", "Conventional Commits", "Keep a Changelog", "Markdown docs"],
        },
        {
          name: "Automation",
          items: ["GitHub Actions", "Pre-commit hooks", "Makefile gate", "setup.sh"],
        },
        {
          name: "Agent integration",
          items: ["CLAUDE.md", "Claude Code Skill", "--json", "intake.yml"],
        },
        {
          name: "Quality",
          items: ["bats", "13 test files", "~875 lines of Bats tests"],
        },
      ],
      architecture: {
        intro:
          "core/ is the stack-agnostic source of truth and is copied into every project; variants/ only overlay the stack-specific parts. The output is plain files in the target project - there is no runtime and no dependency on DevBlueprint itself.",
        points: [
          "core/ holds the agnostic core (git workflow, standards, conventions, quality-and-testing, CLAUDE.md templates); a variant adds only gate commands, CI, .gitignore and wt.conf.",
          "init is overwrite-safe - without --force it overwrites no existing file, so it can be applied to an existing repo.",
          "update re-syncs only the core-owned files and never touches CLAUDE.md, wt.conf, CI or code - core improvements reach old projects without destroying their customizations.",
          "plan is exactly init --dry-run - the same code path with writes short-circuited, so the preview can never diverge from the real output.",
          "Every output is a plain file the target project owns - no framework, no lock-in; DevBlueprint can be deleted afterwards.",
        ],
      },
      challenges: [
        {
          title: "Reusability without lock-in",
          problem:
            "A shared setup as a framework or template repo binds every project to it permanently - updates become a dependency, deviations a fight against the tool.",
          solution:
            "Documentation-first: the output is plain files the project owns and edits freely. There is no runtime; after scaffolding, DevBlueprint can be deleted without anything breaking.",
        },
        {
          title: "Parallel AI sessions without branch collisions",
          problem:
            "Several assistant chats on one repo switch each other's branch away - work lands on the wrong state or is lost.",
          solution:
            "One worktree per task via a single wt script: each task gets its own directory with its own branch (off develop), the main clone stays on master. Sessions no longer collide.",
        },
        {
          title: "One workflow, many stacks",
          problem:
            "The process should be the same everywhere, but the concrete quality-gate commands, CI and ignore rules differ fundamentally by stack.",
          solution:
            "core/ holds the agnostic core, variants/ overlay only the stack-specific parts. A new variant is created by copying a folder and adjusting the gate, wt.conf and CI - it then appears automatically in devblueprint list.",
        },
        {
          title: "Operable by an agent",
          problem:
            "A text CLI is built for humans; an agent must parse the state reliably and confirm before every write.",
          solution:
            "list, doctor and version emit --json (doctor still exits non-zero on errors), an intake.yml plus plan (== init --dry-run) shows exactly the planned output, and a /devblueprint-setup skill interviews, writes the intake file and scaffolds only after confirmation.",
        },
      ],
      metrics: [
        { value: "9", label: "Stack variants" },
        { value: "7", label: "CLI commands" },
        { value: "~1,500", label: "Lines of shell" },
        { value: "13", label: "Bats test files" },
        { value: "117", label: "Commits" },
        { value: "0", label: "Runtime dependencies" },
      ],
      timeline: [
        {
          period: "May 2026",
          title: "Foundation",
          description:
            "Started as an agent project kit with a CLI scaffold, first docs and CI. Five commits lay the base before the concept is reworked.",
        },
        {
          period: "7 July 2026",
          title: "Realignment & build-out",
          description:
            "Rebuilt into a documentation-first engineering kit in one concentrated workday: the core docs, the worktree-based workflow, nine stack variants, the CLI commands (detect, --json, intake + plan, update), the Bats test suite and the agent setup skill. 112 of the 117 commits fall on this day - including dogfooding the setup on its own repo.",
        },
      ],
    },
  },
  "rezepte-app": {
    name: "Recipes App",
    tagline: "An app for collecting, organizing and rediscovering recipes.",
  },
  "daily-dashboard": {
    tagline: "A personal dashboard for daily productivity.",
  },
  "mail-classifier": {
    tagline: "A small tool that automatically sorts incoming mail.",
  },
};

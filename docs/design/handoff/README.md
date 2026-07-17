# Handoff: Portfolio-Webseite — Design System & Hero

## Overview
Persönliche Portfolio-Webseite eines Wirtschaftsinformatik-Studenten (Software / App-Development). Ziel: ein modernes, interaktives Developer-Portfolio, das sich beim Scrollen wie eine kleine Experience anfühlt (Boot-Sequenz, durchlaufende Scroll-Linie, Terminal-Elemente, Dashboard-Widgets), aber trotzdem ruhig, seriös und minimalistisch bleibt.

Dieses Bundle enthält das **finalisierte Design System** (Direction „Sand & Pine + Serif") und eine **fertige Hero-Section** als Referenz. Weitere Sections (Skills, Projekte, Dashboard, Kontakt, Blog) sind noch nicht gebaut — die Doku unten legt aber Tokens & Patterns fest, mit denen sie konsistent entstehen.

## About the Design Files
Die Dateien in diesem Bundle sind **Design-Referenzen, erstellt in HTML** — Prototypen, die Look & Verhalten zeigen, *kein* produktionsfertiger Code zum 1:1-Kopieren.

Die HTML-Dateien nutzen ein internes „Design Component"-Runtime-Format (`<x-dc>`, `support.js`, `class Component extends DCLogic`). **Dieses Format ist nur für die Vorschau — nicht übernehmen.** Die Aufgabe ist, diese Designs in einer echten, eigenen Umgebung neu zu bauen. Empfehlung für dieses Projekt: **Next.js (App Router) + React + TypeScript**, Styling mit **Tailwind CSS** oder CSS-Modules, Scroll-Animationen mit **Framer Motion** oder einer leichten IntersectionObserver/`scroll`-Lösung. Wenn du eine andere Umgebung bevorzugst, gelten dieselben Tokens.

## Fidelity
**High-fidelity (hifi).** Finale Farben, Typografie, Spacing und Interaktionen sind bewusst gesetzt. Bitte pixelgenau nachbauen. Alle Hex-Werte, Font-Größen und Timings unten sind verbindlich.

---

## Design Tokens

### Farben
| Token | Hex | Verwendung |
|---|---|---|
| `bg` | `#EAE6D9` | Seiten-Hintergrund (warmes „Oat"-Sand) |
| `surface` | `#F5F1E7` | Cards, Pills, erhöhte Flächen |
| `ink` | `#1C211C` | Primär-Text, Headlines |
| `ink-soft` | `#57534A` | Fließtext / sekundärer Text |
| `muted` | `#74766B` | Labels, Meta, Captions |
| `line` | `#D8D3C3` | Borders, Trennlinien, Spine-Track |
| `accent-pine` | `#24543F` | **Primär-Akzent (Flächen):** Buttons, Borders aktiv, Headline-Akzent, Spine-Fill |
| `accent-signal` | `#1F8A5B` | **Interaktion/Glow:** Hover, aktive Links, Status-Punkt, Scroll-Node, Widget-Highlights |
| `accent-moss` | `#5C6B4A` | Sekundäre/leise Akzente (optional, z.B. Diagramme, Icons) |

**Regel (wichtig):** Pine trägt die Ruhe (statische Flächen). Signal-Grün nur für Interaktion, Hover und „leuchtende" Elemente. Nie großflächig Signal-Grün einsetzen.

**Accessibility-Override (P1-15):** Als Text-Farben verfehlen die Original-Werte `muted` (`#74766B`) und `signal` (`#1F8A5B`) bei Micro-/Caption-Größen und als Status-Label die WCAG-AA-Schwelle (4.5:1). Die Implementierung nutzt daher `muted #646659` und `signal #157A45` (unverändert im Look, aber AA-konform). Die oben genannten Hex-Werte bleiben als ursprüngliche Design-Referenz stehen; verbindlich für den Build ist die AA-konforme Fassung (siehe `docs/design/accessibility.md` und `docs/design/design-system.md`).

### Terminal / Dark-Kontext (Boot-Overlay, Terminal-Strip)
| Rolle | Hex |
|---|---|
| terminal-bg | `#0F130F` |
| terminal-text | `#E8EDE6` (hell) · `#9BB0A2` (gedämpft) · `#6B7D70` (sehr leise) |
| terminal-green | `#5FB98A` (Prompt/OK/Cursor) |
| terminal-border | `#2A352C` · `#244A34` (grün) |

### Sonstiges
| Rolle | Hex |
|---|---|
| REC-Punkt (rot) | `#C0392B` |

### Typografie
Drei Familien (Google Fonts):
- **Instrument Serif** (400, + italic) — Display / Headlines. Editorial, ruhig. Italic-Variante wird für Akzent-Worte genutzt (oft in `accent-pine`).
- **Hanken Grotesk** (400/500/600) — Fließtext, UI-Text, Buttons-Fallback-Sans.
- **IBM Plex Mono** (400/500/600) — Labels, Kicker, Nav, Buttons, Terminal, alle „technischen" Micro-Texte. Prägt den Charakter.

Import:
```
https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap
```

Type-Skala (aus Hero & System):
| Rolle | Font | Größe | Line-height | Weight | Extra |
|---|---|---|---|---|---|
| Hero-Display | Instrument Serif | 72px | 1.02 | 400 | letter-spacing -0.01em, max-width 14ch |
| Section-Headline (h2) | Instrument Serif | 46px | 1.08 | 400 | |
| Sub-Headline | Instrument Serif | 24px | ~1.2 | 400 | |
| Body groß | Hanken Grotesk | 18px | 1.6 | 400 | max-width ~46ch |
| Body | Hanken Grotesk | 16–17px | 1.6–1.7 | 400 | |
| Mono-Kicker | IBM Plex Mono | 12.5px | — | 500 | letter-spacing 1px, oft UPPERCASE + Pine |
| Section-Label | IBM Plex Mono | 12px | — | 500 | letter-spacing 2px, UPPERCASE, Pine, z.B. „01 / Über mich" |
| Nav / Button | IBM Plex Mono | 13–14px | — | 400–500 | |
| Micro / Caption | IBM Plex Mono | 10–12px | — | 400 | muted |

### Spacing / Layout
- Content-Container: `max-width: 1320px; margin: 0 auto`.
- Horizontales Padding: **links 104px** (Platz für die Scroll-Spine), **rechts 56px**.
- Vertikale Section-Abstände: ~110px top/bottom; Hero hat `padding-top: 150px` (unter fixed Nav).
- Section-Trenner: `border-top: 1px solid #D8D3C3`.

### Radius
- Buttons / Pills-eckig: `9px`
- Cards: `12px`
- Hero-Visual: `16px`
- Runde Pills / Dots: `999px` / `50%`

### Shadows
- Floating Widget: `0 20px 40px -24px rgba(40,60,40,0.4)`
- Node-Dot Ring: `box-shadow: 0 0 0 3px #EAE6D9` (Halo in bg-Farbe)

---

## Screens / Views

### 1. Global — Navigation (fixed)
- **Position:** `position: fixed; top/left/right: 0`, z-index 30. Padding `22px 56px 22px 104px`.
- **Hintergrund:** `linear-gradient(#EAE6D9, rgba(234,230,217,0))` (fade-out nach unten).
- **Links:** Logo `dein.name` (IBM Plex Mono, 14px/500, ink) mit `_`-Cursor in `accent-signal`.
- **Rechts:** Nav-Links (Projekte, Über, Blog, Kontakt) — IBM Plex Mono 13px, Farbe `#57534A`, **Hover → `accent-signal`**. Danach, durch `border-left: 1px solid line` abgetrennt: **Live-Scroll-Prozent** `NN%` (muted mono), das beim Scrollen hochzählt.

### 2. Boot Overlay (Ladeanimation, einmal pro Session)
- **Fullscreen** `position: fixed; inset:0`, z-index 100, bg `#0F130F`.
- Zentrierter Mono-Block (max 520px), zeigt 6 Zeilen einer fake Boot-Sequenz, die **nacheinander einfaden** (`bootline`-Keyframe, staggered `animation-delay` 0.10 / 0.45 / 0.80 / 1.15 / 1.5 / 1.85s):
  ```
  ▸ booting portfolio.os v2.4
  loading modules            ok
  mounting /projects         ok
  establishing uplink        ok
  whoami → dein.name
  ▸ ready▮   (blinkender Cursor)
  ```
  „ok" und `▸` in `#5FB98A`, Werte-Highlights in `#E8EDE6`.
- **Verhalten:** Nach ~2350ms fadet das Overlay aus (opacity → 0 über 0.7s, dann `display:none`). Flag in `sessionStorage['pf_booted']` → in derselben Session **nicht** erneut abspielen (bei gesetztem Flag Overlay sofort ausblenden).

### 3. Hero
- **Layout:** CSS Grid, 2 Spalten `1.15fr / 0.85fr`, gap 56px, `align-items:center`, `min-height:100vh`.
- **Alle Hero-Elemente** faden nacheinander ein (`riseUp`-Keyframe: opacity 0→1 + translateY 16px→0, ~0.8s), gestaffelt **nach** der Boot-Sequenz (delays 2.3–2.78s), damit der Reveal auf das Boot-Ende folgt.

**Linke Spalte:**
- **Kicker** (mono, Pine): Pulsierender Signal-Dot + `WIRTSCHAFTSINFORMATIK · SOFTWARE · APPS`. Dot nutzt `glowPulse` (2.4s, box-shadow-Puls in Signal-Grün).
- **H1** (Instrument Serif 72px): „Ich baue Software, die sich **gut anfühlt.**" — die letzten Worte italic + `accent-pine`.
- **Sub** (Hanken 18px, ink-soft, max 46ch): Intro-Satz.
- **CTA-Reihe** (flex, gap 12px):
  - Primär: „Projekte ansehen →" — bg `pine`, text `surface`, radius 9px, padding 14/22. **Hover: bg → `signal`** (transition 0.2s).
  - Sekundär: „CV laden" — transparent, border `1px #C6C1B0`, text ink. **Hover: border → `pine`**.
  - Tertiär/Ghost: „GitHub ↗" — nur Text in `pine`. **Hover: → `signal`**.
- **Status-Reihe** (flex, gap 20px):
  - Pill (surface bg, line border, radius 999): pulsierender Signal-Dot + „Verfügbar für Werkstudent".
  - Mono-Meta (muted): `GER · 14:32 CET · 18°C` → **später dynamisch** (Location/Time/Weather).

**Rechte Spalte — Hero-Visual (Platzhalter):**
- Card `aspect-ratio: 4/5`, radius 16px, border `line`, diagonaler Streifen-Placeholder-Hintergrund. Text: „[ hero-video.mp4 ] / dein mini-charakter". → **Hier kommt später ein kurzes Video/animierter Charakter rein.**
- Oben-links „REC"-Badge (roter Dot + REC, mono, surface-Pill).
- **Floating „now playing"-Widget** (absolut, bottom -22 / left -24, surface-Card mit Shadow): Mono-Label „// now playing", animierter Equalizer aus 4 Signal-grünen Balken + Text „Lofi & Commits". → **später mit echter Spotify/Now-Data.**

### 4. Terminal-Strip (interaktiv)
- Volle Content-Breite, dunkle Bar (`#0F130F`, radius 12px), Mono. Chrome-Leiste mit
  drei Punkten (zwei inaktiv, einer grün) und Caption `~/portfolio - zsh`.
- **Umgesetzt (P2-1):** echtes interaktives Terminal statt statischer Hint-Zeile - reale
  Eingabezeile mit Command-Parser. Befehle: `help`, `whoami`, `projects`, `contact`,
  `sudo hire-me`, `clear` sowie versteckte Eggs (`ls`, `coffee`, `echo`, bloßes `sudo`).
  Output-Log scrollt, History über Pfeil hoch/runter, unbekannte Befehle mit Hinweis.
- Custom Block-Cursor `▮` in `term-green`, blinkt nur unter `motion-safe` (reduced-motion:
  statisch). Fokus-sicher: kein Focus-Trap, kein Autofocus, `Escape` blurt, sichtbarer
  Signal-Fokusring; Log als `aria-live`-Region.
- Implementierung: `components/widgets/terminal/Terminal.tsx` (Client-Island) über der
  reinen, getesteten Command-Logik in `lib/terminal/`; alle Texte in `content/copy.ts`.

### 5. Scroll-Cue
- Zentriert unter dem Hero: Mono „scroll" (uppercase, letterspaced, muted) + Maus-Glyph (16×26 rounded rect, border), in dem ein Pine-Dot per `cueDot`-Keyframe (1.6s) nach unten läuft.

### 6. Über-mich Teaser (nächste Section, Referenz-Pattern)
- `min-height: 92vh`, `border-top: 1px solid line`.
- **Section-Header-Pattern:** Mono-Label „01 / Über mich" (Pine, letterspaced) + flexible Trennlinie (`flex:1; height:1px; bg line`). **Dieses Muster für ALLE Sections wiederverwenden** (durchnummeriert 01, 02, …).
- 2-Spalten-Grid: links H2 (Instrument Serif 46px, Akzentworte italic+pine), rechts Body-Text.

---

## Interactions & Behavior

### Scroll-Spine (Signature-Element)
- **Fixed** vertikale Linie bei `left: 71px`, `top:0 bottom:0`, width 2px, Track-Farbe `line` (`#D8D3C3`), z-index 5.
- **Fill:** absolut positioniertes Kind, `width:2px`, bg `pine`, **`height` = Scroll-Fortschritt in %**.
- **Node:** Signal-grüner Dot (8px), `top` = Scroll-Fortschritt in %, mit bg-farbenem Halo-Ring, wandert mit dem Fill-Ende.
- **Nav-Prozent** synchron: `NN%`.
- **Berechnung:** `ratio = clamp(scrollY / (scrollHeight - innerHeight), 0, 1)`. Auf `scroll` (passive) und `resize` aktualisieren. Für Performance direkt DOM/Style mutieren bzw. `transform`/`requestAnimationFrame` statt Re-Render.

### Scroll-Position persistent
- `scrollY` throttled (rAF) in `localStorage['pf_scroll_v1']` speichern; beim Laden wiederherstellen (nach erstem Frame `window.scrollTo`).

### Animationen (Keyframes, verbindlich)
| Name | Zweck | Definition |
|---|---|---|
| `blink` | Cursor | 0–49% opacity 1, 50–100% opacity 0, `1.6s step-end infinite` |
| `bootline` | Boot-Zeilen | opacity 0→1 + translateY 4px→0, 0.35s ease, staggered delays |
| `riseUp` | Hero-Reveal | opacity 0→1 + translateY 16px→0, ~0.8s ease forwards, staggered |
| `cueDot` | Scroll-Cue | Dot translateY 0→22px, opacity 0→1→0, 1.6s ease-in-out infinite |
| `glowPulse` | Status/Kicker-Dot | box-shadow-Ring 0→5px, Signal-Grün, 2.4s ease infinite |

### Hover-States
- Alle Links/Buttons: Farb-/Border-Übergang zu `signal` bzw. `pine`, `transition ~0.2s`.

### Verhalten Boot vs. Reload
- Boot-Sequenz nur beim ersten Load pro Session (`sessionStorage`). Reload innerhalb Session → direkt Hero, Scroll-Position wiederhergestellt.

## State Management
- `bootDone` (session-persistent) — steuert Boot-Overlay.
- `scrollRatio` (0..1) — treibt Spine-Fill, Node-Position, Nav-Prozent. **Nicht** über React-State pro Frame rendern; via Ref/DOM oder CSS-Variable setzen.
- (später) Terminal-State: Command-History, Input, Output-Zeilen.
- (später) Live-Daten: Time/Weather/Location, GitHub-Activity/Heatmap, Now-Playing.

## Responsive behavior
- Aktuell für Desktop (≥ ~1100px) ausgelegt. Für Mobile:
  - Hero-Grid → 1 Spalte (Text über Visual).
  - Linkes Padding von 104px reduzieren; Scroll-Spine entweder ausblenden oder an den Rand (z.B. left 20px) legen.
  - Nav-Links ggf. in ein Menü kollabieren.
  - Font-Größen skalieren (Hero-Display 72px → ~clamp(40px, 10vw, 72px)).

## Design Tokens (Kurz-Referenz für Config)
```
--bg:#EAE6D9  --surface:#F5F1E7  --ink:#1C211C  --ink-soft:#57534A
--muted:#74766B  --line:#D8D3C3
--pine:#24543F  --signal:#1F8A5B  --moss:#5C6B4A
--term-bg:#0F130F  --term-green:#5FB98A  --term-text:#E8EDE6

radius: 9 / 12 / 16 / 999
container: 1320px, pad-left 104, pad-right 56
fonts: Instrument Serif · Hanken Grotesk · IBM Plex Mono
```

## Assets
- **Keine Bild-Assets** im Bundle. Platzhalter im Design:
  - Hero-Visual → kurzes Video / animierter „mini-charakter" (bereitzustellen).
  - „now playing"-Widget → echte Now-Playing-Daten (optional Spotify API).
  - Location/Time/Weather → Live-APIs.
  - GitHub-Heatmap/Activity (im Design System skizziert) → GitHub API.
- Fonts via Google Fonts (Link oben).
- Icons: bewusst minimal (CSS-Dots/Shapes). Falls Icon-Set nötig, ein dezentes wählen (z.B. Lucide, dünn).

## Files
In diesem Bundle:
- `Portfolio.dc.html` — Hero-Section + Nav + Boot + Scroll-Spine + Über-mich-Teaser (Haupt-Referenz).
- `Design System.dc.html` — Design-System-Explorationen (3 Haupt-Richtungen + Verfeinerungen). **Maßgeblich ist Option „3a — Sand & Pine + Serif"**; die übrigen sind verworfene Alternativen, nur zur Kontext-Info.

> Hinweis: Beide Dateien im internen `<x-dc>`-Preview-Format. Struktur, Styles, Copy und Timings übernehmen — das Runtime-Wrapping (`support.js`, `DCLogic`, `renderVals`) **nicht**.

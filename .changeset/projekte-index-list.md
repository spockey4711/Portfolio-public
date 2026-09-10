---
"portfolio": minor
---

Turn `/projekte` into a typographic index list instead of a card grid. Four of the six
projects have no real product shot, and the grid handed each of them a framed generated
cover that duplicated the card's own name and tagline - an empty frame that read as an
unfinished template, which is exactly what ADR-0011 says a placeholder must never be.
fuelivo still leads as a full proof card, because its screenshot is real and earns the
space; every other project is now a row: name, type and year, status, and the one line.
The story stays on the detail pages.

Projects gain two required facts, `kind` (`web` | `web-ios` | `ios` | `macos` | `cli`) and
`year`, both read out of each project's own commit history rather than guessed. `kind`
maps to a label in both locales from one table, so German and English can never describe
the same shape differently. Required rather than optional, so a new entry cannot quietly
ship without stating what it is and when it was built.

The four generated `<slug>_cover.png` placeholders are deleted along with the template
that produced them, and `ProjectCard` is gone - the list row replaced it. `pnpm
assets:generate` now produces only the OG image.

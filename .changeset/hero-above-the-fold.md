---
"portfolio": minor
---

Rebuild the hero as a compact masthead so a recruiter can place the person inside the
first viewport (design audit 2026-09, PORT-48): the name is the page's h1, one plain
sentence of positioning (studies, city, current role, current build) sits under it, then
the availability line - the Werdegang's pulsing marker plus the location, still gated
behind `SHOW_AVAILABILITY` so nothing advertises a job search until that switch is
flipped - and two CTAs, "Projekte" and the "Lebenslauf (PDF)" download. The generic
"STUDENT · DEVELOPER · ATHLETE" kicker and the four-line tagline are gone, which brings
the top edge of the fuelivo card into the first viewport at 1440x900. GitHub leaves the
hero for the contact band, which already lists it. The CV download is also offered in the
nav's "Mehr" menu and the phone menu, so it is one click away on every route; the CV copy
moves to a shared top-level `cv` block, and every surface shows the link only while the
file really exists.

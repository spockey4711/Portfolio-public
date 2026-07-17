---
"portfolio": minor
---

Give the featured landing project its own full-width row so it no longer towers over
the two teasers beside it. fuelivo now leads as a "wide" card (cover beside the story
instead of a half-width poster), and the two teaser projects (Aurelian, DevBlueprint)
drop below it one per column, rendering the same flat `problem`/`role`/`learnings` story
their data already held instead of a bare tagline. `FeaturedProject` grew a `layout`
prop ("poster" default, "wide" for the lead), so the projects index page is unchanged;
grid stretch keeps the two teasers equal height whatever the copy length.

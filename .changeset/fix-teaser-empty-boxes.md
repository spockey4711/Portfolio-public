---
"portfolio": patch
---
Fix the Aurelian and DevBlueprint project teasers rendering as tall, mostly empty boxes on the
onepager. In the `lg` bento grid the featured project poster (a two-column lead cell) shares its row
with the two single-column teaser cells, and the grid's default `align-items: stretch` blew each
light teaser card up to the poster's full height, leaving its cover, name and summary stranded at the
top of a stretched, empty card. The teaser cells now opt out of that stretch at `lg` (`lg:self-start`),
so each card keeps its own content height beside the poster while still stretching to match its
sibling teaser at `md`.

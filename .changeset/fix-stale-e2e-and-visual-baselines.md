---
"portfolio": patch
---
Realign the end-to-end and visual-regression suites with the shipped landing redesign so CI runs
green again. The a11y focus-ring test now pins the outline to the `--focus` token (resolved through
a probe element) instead of a hard-coded green literal, since the redesigned tokens are `oklch()`
values that browsers serialize as `lab()`; the primitives test expects the renumbered
`SectionHeader` copy ("Section header", the redesign dropped the chapter number); and the
`scroll-spine` spec is removed because the redesign folded scroll progress into the nav percentage
and no longer renders a standalone spine. The Linux visual baselines are regenerated to match the
redesign's current layout heights.

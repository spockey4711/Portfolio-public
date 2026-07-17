---
"portfolio": patch
---

Density pass on the landing bento grid (R-3). The interactive terminal moves from a half-width
cell to a full-width anchor with a reserved min-height, a higher scroll cap and larger mono text,
so it is comfortably usable and gives the page a strong horizontal beat instead of reading as
box-on-box. The row it vacated is rebalanced (view-all and live-status each span two columns), and
the grid gap and tile padding open up (gap 16 -> 24px across breakpoints, tile padding 20/24 ->
24/32px). DOM order, section anchors and the amber contact band are unchanged; no horizontal
overflow at 320-768px.

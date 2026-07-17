---
"portfolio": patch
---

Give the GitHub contribution heatmap a proper single-hue sequential colour scale (R-5).
The old ramp stepped through amber for levels 1-3 and then jumped to slate-blue (--pine)
at level 4, a hue break that is not a valid sequential scale. It is replaced by a
dedicated `--heat-0..4` amber ramp defined per theme in `globals.css`: one hue, stepping
monotonically darker on light paper and brighter in dark mode, with a near-neutral empty
cell and clearly distinguishable (~9-12% lightness) steps. The widget and legend now
reference the ramp tokens instead of inline opacity values.

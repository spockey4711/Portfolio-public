---
"portfolio": patch
---
Rebalance the onepager grid bottom (R-4). The GitHub heatmap and the WakaTime strip used to sit
side by side at lg, where the tall, narrow WakaTime column forced the wide-but-short heatmap card
to stretch and left a large empty area under the heatmap. They now stack as two full-width rows,
GitHub above WakaTime, so neither has a mismatched-height neighbour. The heatmap grid grows to fill
its full-width row (columns use `minmax(11px, 1fr)` with square cells) instead of sitting at a fixed
width, so the wider row has no dead space to its right; on narrow screens the 11px floor keeps the
existing horizontal scroll. DOM and mobile order stay sensible: the two live-coding signals remain
adjacent, heatmap first.

---
"portfolio": patch
---

Rebalance the landing "live" cluster. The now-playing tile and the signals-of-life feed
move from a 1:1 to a 2:3 split so the compact now-playing box no longer floats
half-empty beside the denser feed, and the signals feed drops its duplicated now-playing
row - it sits right beside the dedicated now-playing tile on the onepager, so the second
copy (and its extra poll of `/api/now-playing`) was redundant.

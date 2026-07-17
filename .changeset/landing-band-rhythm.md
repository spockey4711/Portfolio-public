---
"portfolio": minor
---

Break the landing page out of one wall-to-wall bento grid into a vertical stack of
bands that alternate two registers, so the page breathes instead of reading as
box-on-box. Open editorial bands - about, experience, skills - now sit as plain prose
straight on the paper background, separated by whitespace and a hairline rule.
Framed instrument clusters - the projects poster + teasers, the terminal, the
live-status/signals pair, and the WakaTime + GitHub stats - keep their borders,
because for a real-UI widget (a terminal window, a contribution heatmap) the frame is
the metaphor. Each cluster is introduced by an editorial lead-in on the background
(new `landing.*` copy, de + en), the "background with text" beat before the boxes
resume. Two new layout primitives (`Band`, `BandIntro`) own the shared measure and the
interstitial. DOM order, the five section anchors (#projekte, #ueber, #werdegang,
#skills, #kontakt) and the amber contact band are unchanged; every band collapses to a
single column on mobile with no horizontal overflow at 320-768px.

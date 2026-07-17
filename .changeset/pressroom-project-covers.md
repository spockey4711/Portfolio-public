---
"portfolio": patch
---
Refresh the generated project covers and default OG image onto the Pressroom palette (R-7). The
asset generator still hardcoded the retired Sand & Pine tokens (green pine, Instrument Serif),
so every regenerated cover clashed with the redesigned site. Port `scripts/generate-assets.mjs`
to the current tokens and typefaces - warm slate-cream paper, the slate/amber duo, and the Big
Shoulders display over IBM Plex Sans/Mono - and regenerate all covers plus the OG share image.
fuelivo's unconvincing product screenshot is replaced by an on-brand generated headline cover,
and the now-orphaned `fuelivo_screen.png` is removed. Each cover's status label now carries the
same colour as the site's `ProjectStatusBadge`.

---
"portfolio": patch
---
Fix the nav scroll percentage reaching 100% before the true bottom of the onepager. The redesign
added `overflow-x: clip` to the root, which turns `html` into a scroll container whose own box is
pinned to the viewport height, so the `ResizeObserver` on `document.documentElement` stopped firing
when the document grew after mount (fonts settling, media loading) and the cached scrollable height
went stale. The observer now watches `document.body`, whose box tracks content height, so progress
stays exact all the way to the end.

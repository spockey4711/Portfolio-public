/**
 * Shared constants for the boot overlay (P1-5). The overlay plays once per
 * browser session and is skipped under reduced motion; both the pre-paint guard
 * script and the React component must agree on the storage key and the marker,
 * so they live here (see docs/design/animation-and-motion.md).
 */

// sessionStorage key that records that the boot sequence has already played this
// session. Set once the overlay starts; a reload within the session finds it and
// goes straight to the hero.
export const BOOT_STORAGE_KEY = "pf_booted";

// Marker written on <html> to opt a session into the boot animation.
export const BOOT_ATTR = "data-boot";
export const BOOT_PLAY = "play";

/**
 * Pre-paint guard, injected as an inline script in the document <head> so it runs
 * before the overlay is painted. It opts this session into the animation - by
 * setting `data-boot="play"` on <html> - only on the first visit of a session
 * with motion allowed. The overlay is `display:none` until that marker is
 * present (globals.css), so a returning or reduced-motion visitor never sees a
 * flash of it. Kept dependency-free and wrapped in try/catch because it runs
 * before hydration and Storage/matchMedia can throw in locked-down contexts.
 */
export const BOOT_GUARD_SCRIPT = `(function(){try{var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;var b=window.sessionStorage.getItem("${BOOT_STORAGE_KEY}");if(!r&&!b){document.documentElement.setAttribute("${BOOT_ATTR}","${BOOT_PLAY}");}}catch(e){}})();`;

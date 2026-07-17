/**
 * Pre-paint coordination for the hero reveal offset.
 *
 * The hero elements rise in with `animation-delay: calc(var(--hero-reveal-offset)
 * + stagger)` (globals.css defines the 0s default and the `rise-up` keyframe). On a
 * first, motion-allowed visit the boot overlay opts in (`data-boot="play"`) and the
 * rise must wait for the boot end; on a returning / reduced-motion visit it starts
 * immediately.
 *
 * This inline script, injected right after the boot guard in `app/layout.tsx`, reads
 * that decision once before first paint and freezes the offset as an inline style on
 * <html>. Freezing it - rather than keying a stylesheet rule to `data-boot` - matters
 * because the boot overlay removes `data-boot` when it unmounts (~3s in), mid-rise; a
 * stylesheet rule would then revert the offset and snap the still-animating elements.
 * The inline style survives that removal, so the rise plays out cleanly. Kept
 * dependency-free and wrapped in try/catch because it runs before hydration.
 */

// The CSS custom property the hero elements read; the 0s default lives in globals.css.
export const HERO_REVEAL_VAR = "--hero-reveal-offset";

// How long the rise waits when the boot sequence plays, so it follows the boot end
// (~2350ms fade-out start). Binding from the design handoff (delays ~2.3-2.78s).
export const HERO_REVEAL_BOOT_OFFSET = "2.3s";

export const HERO_REVEAL_SCRIPT = `(function(){try{var d=document.documentElement;var play=d.getAttribute("data-boot")==="play";d.style.setProperty("${HERO_REVEAL_VAR}",play?"${HERO_REVEAL_BOOT_OFFSET}":"0s");}catch(e){}})();`;

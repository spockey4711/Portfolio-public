"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import { type Copy, getCopy } from "@/content/copy";
import { useTheme } from "@/lib/chrome/use-theme";
import { COMMAND_PALETTE_OPEN_EVENT } from "@/lib/command-palette/commands";
import { useScrollProgress } from "@/lib/hooks/use-scroll-progress";
import { type Locale } from "@/lib/i18n/locale";
import { counterpartPath, isRouteTranslated, localizedPath, otherLocale } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils/cn";

type NavLink = Copy["nav"]["links"][number];
type NavPageLink = Copy["nav"]["pageLinks"][number];
type CvCopy = Copy["cv"];
type LanguageCopy = Copy["nav"]["language"];
type ThemeCopy = Copy["nav"]["theme"];
type CommandPaletteCopy = Copy["commandPalette"];

/**
 * Global navigation chrome: a fixed print slab - solid paper background closed by
 * a 2px ink rule, so content scrolls under a hard edge. The display-face wordmark
 * sits left; the tracked-uppercase section links, a "Mehr" menu and a live scroll
 * percentage sit right.
 *
 * The header is the map of the one-pager, nothing else (ADR-0005): the section
 * links scroll within it. Everything that *leaves* the one-pager - the page links
 * (blog, uses, now), the CV download, the language toggle and the command palette -
 * is collapsed on desktop behind a single "Mehr" disclosure so a section anchor and
 * a page navigation can never look alike. Page-link hrefs point straight at the route
 * (not through `hrefToHomeAnchor`) and carry a trailing arrow.
 *
 * The nav is mounted in each locale's root layout, so it also renders on
 * sub-routes (the project detail pages) where the linked sections do not exist.
 * Each section link must therefore point at the home route plus a hash and, from a
 * sub-route, navigate home first and then jump to the anchor. We pass `next/link`
 * an explicit `{ pathname, hash }` object rather than a `"/#hash"` string, because
 * the string form is collapsed to a same-page hash that never leaves the detail
 * page (see `hrefToHomeAnchor`). Smooth-scrolling and offsetting the anchors below
 * the nav are handled in CSS (`scroll-behavior` / `scroll-padding-top` in
 * globals.css), which also gives us the reduced-motion fallback for free.
 *
 * The percentage counts up while scrolling but must never re-render React per
 * frame, so `useScrollProgress` writes it straight to the node's `textContent`
 * via a ref (see docs/design/animation-and-motion.md).
 *
 * Responsive (docs/design/responsive-and-mobile.md): the inline section links, the
 * "Mehr" menu and the percentage are desktop flourishes. They show from `md` up;
 * below `md` the header degrades to logo + a single menu affordance that toggles a
 * collapsed panel holding *every* destination (sections, pages, command palette,
 * language), so the row can never overflow a phone. Horizontal padding follows the
 * canonical shell (`px-6 sm:px-10 lg:pr-14 lg:pl-26`) and the fixed header respects
 * `env(safe-area-inset-*)` so its content clears a notch or the home indicator.
 */

/**
 * Escape-to-close and click-outside dismissal for a disclosure. While `open`,
 * Escape closes it and returns focus to the trigger, and a pointer press outside
 * `container` dismisses it. Listeners attach only while open, so a closed
 * disclosure adds no global handlers. This is a lightweight disclosure, not a
 * modal: focus is not trapped, so normal tabbing keeps working. Shared by the
 * phone menu and the desktop "Mehr" menu so both dismiss identically.
 */
function useDismiss(
  open: boolean,
  close: () => void,
  container: RefObject<HTMLElement | null>,
  trigger: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        trigger.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close, container, trigger]);
}

/**
 * Split a root-relative anchor (`"/#projekte"`, or `"/en#projekte"`) into the
 * `{ pathname, hash }` object `next/link` needs to treat it as a real cross-route
 * navigation. A bare `"#kontakt"` (no slash) degrades to a same-page hash on the
 * current route.
 */
function hrefToHomeAnchor(href: string): { pathname: string; hash?: string } {
  const [pathname, hash] = href.split("#");
  return { pathname: pathname || "/", hash: hash || undefined };
}

/**
 * The section links, shared by the desktop inline row and the phone menu panel
 * so the hrefs live in one place. `linkClassName` tunes size/hit area per
 * surface; `onNavigate` lets the panel close itself when a link is followed.
 */
function NavLinks({
  links,
  linkClassName,
  onNavigate,
}: {
  links: readonly NavLink[];
  linkClassName?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={hrefToHomeAnchor(href)}
            onClick={onNavigate}
            className={cn(
              "font-mono tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal",
              linkClassName,
            )}
          >
            {label}
          </Link>
        </li>
      ))}
    </>
  );
}

/**
 * Page-level nav destinations (blog, uses, now). Unlike NavLinks these *leave* the
 * one-pager, so they carry a trailing arrow and point straight at the route (no
 * `hrefToHomeAnchor` rewrite). The arrow is an aria-hidden flourish, keeping the
 * accessible name the bare label. `liClassName` carries any per-item divider.
 */
function PageLinks({
  links,
  liClassName,
  linkClassName,
  onNavigate,
}: {
  links: readonly NavPageLink[];
  liClassName?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map(({ href, label }) => (
        <li key={href} className={liClassName}>
          <Link
            href={href}
            onClick={onNavigate}
            className={cn(
              "font-mono tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal",
              linkClassName,
            )}
          >
            {label}
            <span aria-hidden className="ml-1">
              →
            </span>
          </Link>
        </li>
      ))}
    </>
  );
}

/**
 * The CV download in the menus (PORT-48): a plain anchor with `download`, since the
 * target is a static PDF rather than a route - no next/link, no translated-route
 * gate. It sits with the page links because it, too, leaves the one-pager
 * (ADR-0005), and renders only while the file really exists (see `cvAvailable` on
 * Nav). The arrow is aria-hidden so the accessible name stays the bare label.
 */
function CvLink({
  copy,
  className,
  onNavigate,
}: {
  copy: CvCopy;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={copy.href}
      download
      onClick={onNavigate}
      className={cn(
        "font-mono tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal",
        className,
      )}
    >
      {copy.label}
      <span aria-hidden className="ml-1">
        ↓
      </span>
    </a>
  );
}

/**
 * The language toggle: a plain anchor to the counterpart URL in the other locale.
 * It deliberately uses `<a>` rather than `next/link` because German and English
 * live under separate root layouts, so switching is a full document load (which
 * also swaps `<html lang>`); `hrefLang`/`lang` name the target language for
 * assistive tech and crawlers.
 */
function LanguageToggle({
  href,
  targetLocale,
  copy,
  className,
  onNavigate,
}: {
  href: string;
  targetLocale: Locale;
  copy: LanguageCopy;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={href}
      hrefLang={targetLocale}
      lang={targetLocale}
      aria-label={copy.switchTo}
      onClick={onNavigate}
      className={cn(
        "font-mono tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal",
        className,
      )}
    >
      {copy.label}
    </a>
  );
}

/**
 * The command palette trigger: a button that only dispatches the shared open event
 * so it stays decoupled from the palette island (which listens for it). Rendered
 * inside the "Mehr" menu on desktop and the phone menu, since keyboard users reach
 * the palette through its global shortcut instead.
 */
function CommandPaletteTrigger({
  copy,
  className,
  onActivate,
}: {
  copy: CommandPaletteCopy;
  className?: string;
  onActivate?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT));
        onActivate?.();
      }}
      aria-label={copy.trigger}
      className={cn(
        "font-mono tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal",
        className,
      )}
    >
      {copy.label}
      <kbd className="ml-2 font-mono text-muted">⌘K</kbd>
    </button>
  );
}

/**
 * The dark-mode toggle. A toggle button wired to `useTheme`; clicking flips
 * the theme and persists the choice. Dark mode is off by default (ADR-0007), so the
 * button reads "aus" until pressed. `aria-pressed` carries the on/off state for
 * assistive tech, so the visible on/off word beside the label is an aria-hidden
 * flourish. It deliberately does not close the menu, so the user can watch the swap
 * and flip back without reopening. Rendered in the desktop "Mehr" menu and the phone
 * menu, next to the command palette and language controls.
 */
function ThemeToggle({ copy, className }: { copy: ThemeCopy; className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={copy.label}
      className={cn(
        "font-mono tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal",
        className,
      )}
    >
      <span>{copy.label}</span>
      <span aria-hidden className="ml-2 whitespace-nowrap text-muted">
        [ {isDark ? copy.on : copy.off} ]
      </span>
    </button>
  );
}

/** A small chevron that rotates to point up while the menu is open. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform duration-200", open && "rotate-180")}
    >
      <path d="M3 4.5 6 7.5 9 4.5" />
    </svg>
  );
}

/** The menu affordance glyph: three rules when closed, an X when open. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <line x1="5" y1="5" x2="15" y2="15" />
          <line x1="15" y1="5" x2="5" y2="15" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="17" y2="6" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="14" x2="17" y2="14" />
        </>
      )}
    </svg>
  );
}

/**
 * Desktop "Mehr" menu: a disclosure button whose panel groups every destination
 * that leaves the one-pager (page links, the CV download, the command palette, the
 * language toggle) plus the dark-mode toggle, keeping the inline row a clean map of the sections
 * (ADR-0005). Its own state and refs make it self-contained; `useDismiss` gives it
 * Escape/outside-click parity with the phone menu. The panel is rendered only while
 * open, so the closed nav has no hidden links and the panel stays out of the a11y tree.
 */
function MoreMenu({
  moreLabel,
  pageLinks,
  cvCopy,
  cvAvailable,
  languageHref,
  targetLocale,
  languageCopy,
  commandPalette,
  themeCopy,
}: {
  moreLabel: string;
  pageLinks: readonly NavPageLink[];
  cvCopy: CvCopy;
  cvAvailable: boolean;
  languageHref: string;
  targetLocale: Locale;
  languageCopy: LanguageCopy;
  commandPalette: CommandPaletteCopy;
  themeCopy: ThemeCopy;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, close, containerRef, buttonRef);

  return (
    <div ref={containerRef} className="relative border-l border-line pl-4">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="nav-more"
        className="flex items-center gap-1 font-mono text-[13px] text-ink-soft transition-colors duration-200 hover:text-signal"
      >
        {moreLabel}
        <Chevron open={open} />
      </button>

      {open && (
        <div
          id="nav-more"
          className="absolute top-full right-0 mt-3 min-w-44 rounded-card border-2 border-ink bg-surface p-2 shadow-widget"
        >
          <ul className="flex flex-col">
            <PageLinks
              links={pageLinks}
              liClassName="flex"
              linkClassName="flex flex-1 items-center px-2 py-2 text-[13px]"
              onNavigate={close}
            />
            {cvAvailable ? (
              <li className="flex">
                <CvLink
                  copy={cvCopy}
                  className="flex flex-1 items-center px-2 py-2 text-[13px]"
                  onNavigate={close}
                />
              </li>
            ) : null}
          </ul>
          <div className="my-1 border-t border-line" />
          <div className="flex flex-col">
            <CommandPaletteTrigger
              copy={commandPalette}
              className="flex items-center px-2 py-2 text-left text-[13px]"
              onActivate={close}
            />
            <LanguageToggle
              href={languageHref}
              targetLocale={targetLocale}
              copy={languageCopy}
              className="flex items-center px-2 py-2 text-[13px]"
              onNavigate={close}
            />
            <ThemeToggle
              copy={themeCopy}
              className="flex w-full items-center justify-between px-2 py-2 text-[13px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * `cvAvailable` comes from the server-rendered SiteChrome: whether the CV file really
 * exists (lib/content/cv.ts reads the filesystem, which this client component
 * cannot), so the menus offer the download only when it would not be a dead link.
 */
export function Nav({ locale, cvAvailable }: { locale: Locale; cvAvailable: boolean }) {
  const { nav, commandPalette, cv } = getCopy(locale);
  // usePathname() is typed as string but is null until the router has mounted (and
  // when the nav is rendered in isolation, e.g. tests); fall back to this locale's
  // home so the language toggle always resolves to a real counterpart URL.
  const pathname = usePathname() ?? localizedPath("home", locale);
  const targetLocale = otherLocale[locale];
  const counterpartHref = counterpartPath(pathname, locale);
  // Only page links whose variant exists in this locale are shown, so the English
  // nav never links to a route that has not shipped yet (translatedRoutes).
  const pageLinks = nav.pageLinks.filter((link) => isRouteTranslated(link.route, locale));

  const percentRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleProgress = useCallback((ratio: number) => {
    const node = percentRef.current;
    if (node) {
      node.textContent = `${Math.round(ratio * 100)}%`;
    }
  }, []);

  useScrollProgress(handleProgress);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useDismiss(menuOpen, closeMenu, headerRef, toggleRef);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-30 border-b-2 border-ink bg-bg pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
    >
      <nav
        aria-label={nav.label}
        className="mx-auto flex max-w-(--container-max) items-center justify-between px-6 py-[15px] sm:px-10 lg:px-14"
      >
        {/* Wordmark in the display face - the slab nav's one loud element. No
            blinking cursor here: the caret lives only where the user can type
            (the terminal widget). */}
        <Link
          href={{ pathname: localizedPath("home", locale), hash: "top" }}
          className="font-display text-lg font-bold tracking-[0.02em] whitespace-nowrap text-ink uppercase transition-colors duration-200 hover:text-signal"
        >
          {nav.logo}
        </Link>

        {/* Desktop: the inline section links, the "Mehr" menu (page links + CV +
            command palette + language) and the live scroll percentage, all hidden
            below md where the phone menu takes over. */}
        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-6">
            <NavLinks links={nav.links} linkClassName="text-[13px]" />
          </ul>

          {/* Everything that leaves the one-pager sits behind one disclosure so it
              can never be mistaken for a section anchor (ADR-0005). */}
          <MoreMenu
            moreLabel={nav.more.label}
            pageLinks={pageLinks}
            cvCopy={cv}
            cvAvailable={cvAvailable}
            languageHref={counterpartHref}
            targetLocale={targetLocale}
            languageCopy={nav.language}
            commandPalette={commandPalette}
            themeCopy={nav.theme}
          />

          <span
            aria-hidden
            className="border-l border-line pl-4 font-mono text-[13px] text-muted tabular-nums"
          >
            <span ref={percentRef}>0%</span>
          </span>
        </div>

        {/* Phone: a single ~44px menu affordance that toggles the collapsed
            links. The negative margin optically aligns the icon with the padded
            edge despite the button's own hit-area whitespace. */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          aria-label={menuOpen ? nav.menu.close : nav.menu.open}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-ink transition-colors duration-200 hover:text-signal md:hidden"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </nav>

      {/* The collapsed link list, rendered only while open so the closed nav has
          no duplicate or hidden links and the panel stays out of the a11y tree.
          Each item is a >=44px tap target. It carries every destination: the
          section anchors, then the page links and the CV download, the command
          palette and the language toggle past a divider. */}
      {menuOpen && (
        <div id="nav-menu" className="mx-auto max-w-(--container-max) px-6 pb-4 sm:px-10 md:hidden">
          <ul className="flex flex-col border-t border-line pt-1">
            <NavLinks
              links={nav.links}
              linkClassName="flex min-h-11 items-center text-[15px]"
              onNavigate={closeMenu}
            />
            {/* A per-item top border keeps the page links visually apart from the
                scroll anchors, mirroring the desktop divider. */}
            <PageLinks
              links={pageLinks}
              liClassName="mt-1 border-t border-line pt-1"
              linkClassName="flex min-h-11 items-center text-[15px]"
              onNavigate={closeMenu}
            />
            {cvAvailable ? (
              <li className="mt-1 border-t border-line pt-1">
                <CvLink
                  copy={cv}
                  className="flex min-h-11 items-center text-[15px]"
                  onNavigate={closeMenu}
                />
              </li>
            ) : null}
            <li className="mt-1 border-t border-line pt-1">
              <CommandPaletteTrigger
                copy={commandPalette}
                className="flex min-h-11 w-full items-center text-[15px]"
                onActivate={closeMenu}
              />
            </li>
            <li className="mt-1 border-t border-line pt-1">
              <LanguageToggle
                href={counterpartHref}
                targetLocale={targetLocale}
                copy={nav.language}
                className="flex min-h-11 items-center text-[15px]"
                onNavigate={closeMenu}
              />
            </li>
            <li className="mt-1 border-t border-line pt-1">
              <ThemeToggle
                copy={nav.theme}
                className="flex min-h-11 w-full items-center justify-between text-[15px]"
              />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

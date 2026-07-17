import { About } from "@/components/sections/about/About";
import { Band } from "@/components/sections/bento/Band";
import { BandIntro } from "@/components/sections/bento/BandIntro";
import { Tile } from "@/components/sections/bento/Tile";
import { Contact } from "@/components/sections/contact/Contact";
import { Experience } from "@/components/sections/experience/Experience";
import { Hero } from "@/components/sections/hero/Hero";
import { LiveStatus } from "@/components/sections/hero/LiveStatus";
import { Projects } from "@/components/sections/projects/Projects";
import { Skills } from "@/components/sections/skills/Skills";
import { GithubActivity } from "@/components/widgets/github-activity/GithubActivity";
import { SignalsOfLife, type SignalsPost } from "@/components/widgets/signals/SignalsOfLife";
import { Terminal } from "@/components/widgets/terminal/Terminal";
import { Wakatime } from "@/components/widgets/wakatime/Wakatime";
import { getCopy } from "@/content/copy";
import { getAllPosts } from "@/lib/content/blog";
import { type Locale, localeTag } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";

/**
 * Shapes the newest published post into the signals-of-life feed's latest-post row,
 * or null when no post exists yet (the feed then shows its quiet fallback). Runs on
 * the server at build time - the blog registry is a filesystem read - so the row is
 * static HTML, not a client fetch. The date is formatted for the active locale in
 * UTC, matching the blog's own `formatPostDate`, so any build timezone renders the
 * same day.
 */
function latestPostSignal(locale: Locale): SignalsPost | null {
  const [latest] = getAllPosts();
  if (!latest) {
    return null;
  }

  const dateLabel = new Intl.DateTimeFormat(localeTag[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${latest.date}T00:00:00Z`));

  return {
    title: latest.title,
    href: localizedPath("blogPost", locale, latest.slug),
    dateLabel,
    dateIso: latest.date,
  };
}

/**
 * The onepager body: the broadsheet hero, then a vertical stack of bands instead
 * of one wall-to-wall grid. Two registers alternate so the page breathes:
 *
 * - Open editorial bands - about, experience, skills - sit as plain prose
 *   straight on the paper background, separated by whitespace and a hairline rule.
 * - Framed instrument clusters - the projects poster + teasers, the terminal, the
 *   live-status/signals pair, the WakaTime + GitHub stats - keep their borders,
 *   because for a real-UI widget (a terminal window, a contribution heatmap) the
 *   frame *is* the metaphor. Each cluster is introduced by an editorial lead-in
 *   on the background (BandIntro), the "background with text" beat before the
 *   boxes resume.
 *
 * A box returns only where a widget earns its frame; everything else is open. The
 * amber contact band closes the page.
 *
 * DOM order is the single-column phone order and keeps the narrative: projects,
 * terminal, about, live signals, experience, skills, stats, contact. The section
 * anchors (#projekte, #ueber, #werdegang, #skills, #kontakt) stay in that vertical
 * order, so the nav links keep working from every route. Every framed tile carries
 * `min-w-0` so long content can never widen a track.
 *
 * Locale-parameterized so the German (`/`) and English (`/en`) home pages render
 * the exact same tree, only the copy differs.
 */
export function Onepager({ locale }: { locale: Locale }) {
  const { hero, landing } = getCopy(locale);

  return (
    // id="main" + tabIndex=-1: the skip link (SiteChrome) targets this so keyboard
    // focus lands on the content, past the fixed nav.
    <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
      <Hero locale={locale} />

      {/* The band stack. Generous vertical gaps carry the rhythm; open prose bands
          add a hairline top rule, framed clusters lead with a BandIntro. */}
      <div className="flex flex-col gap-16 pb-24 sm:gap-20 lg:gap-24">
        {/* Projects cluster: the featured poster + two teasers + the slate index. */}
        <Band className="flex flex-col gap-8">
          <BandIntro eyebrow={landing.projects.eyebrow} lead={landing.projects.lead} />
          {/* Two columns: the featured card spans the full row (md:col-span-2),
              the two teasers share the row beneath it, one per column. */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
            <Projects locale={locale} />
          </div>
        </Band>

        {/* The interactive terminal: the page's dark full-width anchor. */}
        <Band>
          <Terminal locale={locale} />
        </Band>

        {/* About - open prose straight on the paper, set off by a hairline rule. */}
        <Band className="border-t border-line pt-16 sm:pt-20">
          <About locale={locale} className="max-w-[68ch]" />
        </Band>

        {/* Live cluster: the compact now-playing module beside the denser
            signals-of-life feed. A 2:3 split (not 1:1) sizes each box to its
            content, so the small now-playing tile no longer floats in a half-empty
            box next to the taller feed. */}
        <Band className="flex flex-col gap-8">
          <BandIntro eyebrow={landing.live.eyebrow} lead={landing.live.lead} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-5 lg:gap-6">
            <Tile
              aria-label={hero.visual.nowPlaying.label}
              className="justify-center md:col-span-2"
            >
              <LiveStatus copy={hero} />
            </Tile>
            <div className="min-w-0 md:col-span-3">
              <SignalsOfLife locale={locale} latestPost={latestPostSignal(locale)} />
            </div>
          </div>
        </Band>

        {/* Experience + Skills - two open prose columns sharing a band. */}
        <Band className="border-t border-line pt-16 sm:pt-20">
          <div className="grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-2">
            <Experience locale={locale} />
            <Skills locale={locale} />
          </div>
        </Band>

        {/* Stats cluster: WakaTime beside the wide GitHub contribution heatmap. */}
        <Band className="flex flex-col gap-8">
          <BandIntro eyebrow={landing.stats.eyebrow} lead={landing.stats.lead} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
            <div className="min-w-0">
              <Wakatime locale={locale} />
            </div>
            <div className="min-w-0 md:col-span-2">
              <GithubActivity locale={locale} />
            </div>
          </div>
        </Band>

        {/* The loud amber closing band (the one framed tile that stays coloured). */}
        <Band>
          <Contact locale={locale} />
        </Band>
      </div>
    </main>
  );
}

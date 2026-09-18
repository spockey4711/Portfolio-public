import { About } from "@/components/sections/about/About";
import { Band } from "@/components/sections/bento/Band";
import { BandIntro } from "@/components/sections/bento/BandIntro";
import { Contact } from "@/components/sections/contact/Contact";
import { Experience } from "@/components/sections/experience/Experience";
import { Hero } from "@/components/sections/hero/Hero";
import { Projects } from "@/components/sections/projects/Projects";
import { Skills } from "@/components/sections/skills/Skills";
import { GithubActivity } from "@/components/widgets/github-activity/GithubActivity";
import { getCopy } from "@/content/copy";
import { type Locale } from "@/lib/i18n/locale";

/**
 * The onepager body: the broadsheet hero, then a vertical stack of bands instead
 * of one wall-to-wall grid. Two registers alternate so the page breathes:
 *
 * - Open editorial bands - about, experience, skills - sit as plain prose
 *   straight on the paper background, separated by whitespace and a hairline rule.
 * - Framed instrument clusters - the projects poster + teasers, the GitHub
 *   contribution heatmap - keep their borders, because for a real-UI widget (a
 *   contribution heatmap) the frame *is* the metaphor. Each cluster is introduced
 *   by an editorial lead-in on the background (BandIntro), the "background with
 *   text" beat before the boxes resume.
 *
 * The heatmap is the one signature widget the one-pager keeps (ADR-0011): a
 * passive, universally legible "this person codes, regularly, for real" proof.
 * The terminal, now-playing, signals-of-life and WakaTime widgets moved off the
 * one-pager into the depth layer - only what a hiring person must see stays here.
 *
 * A box returns only where a widget earns its frame; everything else is open. The
 * amber contact band closes the page.
 *
 * DOM order is the single-column phone order and keeps the narrative: projects,
 * about, experience, skills, heatmap, contact. The section anchors (#projekte,
 * #ueber, #werdegang, #skills, #kontakt) stay in that vertical order, so the nav
 * links keep working from every route. Every framed tile carries `min-w-0` so long
 * content can never widen a track.
 *
 * Locale-parameterized so the German (`/`) and English (`/en`) home pages render
 * the exact same tree, only the copy differs.
 */
export function Onepager({ locale }: { locale: Locale }) {
  const { landing } = getCopy(locale);

  return (
    // id="main" + tabIndex=-1: the skip link (SiteChrome) targets this so keyboard
    // focus lands on the content, past the fixed nav.
    <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
      <Hero locale={locale} />

      {/* The band stack. Generous vertical gaps carry the rhythm; open prose bands
          add a hairline top rule, framed clusters lead with a BandIntro. */}
      <div className="flex flex-col gap-16 pb-24 sm:gap-20 lg:gap-24">
        {/* Projects cluster: one wide proof, two differently shaped teasers and
            the slate index link. Projects owns the asymmetric internal grid. */}
        <Band className="flex flex-col gap-8">
          <BandIntro eyebrow={landing.projects.eyebrow} lead={landing.projects.lead} />
          <Projects locale={locale} />
        </Band>

        {/* About - open prose straight on the paper, set off by a hairline rule. */}
        <Band className="border-t border-line pt-16 sm:pt-20">
          <About locale={locale} className="max-w-[68ch]" />
        </Band>

        {/* Experience + Skills - two open prose columns sharing a band. */}
        <Band className="border-t border-line pt-16 sm:pt-20">
          <div className="grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-2">
            <Experience locale={locale} />
            <Skills locale={locale} />
          </div>
        </Band>

        {/* The one signature widget (ADR-0011): the full-width GitHub heatmap. */}
        <Band className="flex flex-col gap-8">
          <BandIntro eyebrow={landing.github.eyebrow} lead={landing.github.lead} />
          <div className="min-w-0">
            <GithubActivity locale={locale} />
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

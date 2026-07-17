import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/sections/projects/ProjectDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { detailProjects, getDetailProject } from "@/content/projects";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig, siteUrl } from "@/lib/seo/site";
import { projectBreadcrumbJsonLd, projectJsonLd, projectKeywords } from "@/lib/seo/structured-data";

import type { Metadata } from "next";

// This route lives in the German (de) tree; its English twin is
// app/(en)/en/projects/[slug]/page.tsx (S5-1b).
const locale = "de";

// Only projects flagged `detailPage` get a page, and only those are pre-rendered;
// dynamicParams=false makes every other /projekte/* slug a static 404 instead of
// a runtime render (the whole set is known at build time).
export const dynamicParams = false;

export function generateStaticParams() {
  return detailProjects.map((project) => ({ slug: project.slug }));
}

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getDetailProject(slug, locale);

  if (!project) {
    return {};
  }

  // Now that the English twin is live (S5-1b), the detail page advertises the
  // reciprocal de-DE/en/x-default hreflang pair, keyed off the same route map as
  // the sitemap so the two can never drift.
  const alternates = alternatesFor("projectDetail", locale, project.slug);
  const keywords = projectKeywords(project);

  return {
    // The layout title template appends the site name: "fuelivo - Yannik Wünker".
    title: project.name,
    description: project.tagline,
    // The project's own tech stack as page keywords, so the per-route metadata is
    // specific to this project rather than the generic site set.
    ...(keywords.length > 0 ? { keywords } : {}),
    authors: [{ name: siteConfig.name, url: siteUrl }],
    alternates: { canonical: alternates.canonical, languages: alternates.languages },
    openGraph: {
      type: "article",
      url: alternates.canonical,
      title: `${project.name} - ${siteConfig.name}`,
      description: project.tagline,
      // og:image comes from the branded card in ./opengraph-image (S5-3); leaving
      // openGraph.images unset lets that file convention drive it (a value here
      // would take precedence over the generated card).
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getDetailProject(slug, locale);

  // Unreachable while dynamicParams=false, but keeps the type honest and guards
  // the page if that ever changes.
  if (!project) {
    notFound();
  }

  // The other detail-page projects, for the internal-linking footer (S5-2).
  // Localized like the current one, ordering preserved (featured first).
  const related = detailProjects
    .filter((entry) => entry.slug !== project.slug)
    .map((entry) => getDetailProject(entry.slug, locale))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

  return (
    <>
      {/* CreativeWork + breadcrumb structured data for this project (S5-2). Kept
          out of generateMetadata because JSON-LD ships in the body, not the head. */}
      <JsonLd data={projectJsonLd(project, locale)} />
      <JsonLd data={projectBreadcrumbJsonLd(project, locale)} />
      <ProjectDetail project={project} locale={locale} related={related} />
    </>
  );
}

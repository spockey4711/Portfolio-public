import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/sections/projects/ProjectDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { detailProjects, getDetailProject } from "@/content/projects";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig, siteUrl } from "@/lib/seo/site";
import { projectBreadcrumbJsonLd, projectJsonLd, projectKeywords } from "@/lib/seo/structured-data";

import type { Metadata } from "next";

// The English project detail page (S5-1b), twin of
// app/(de)/projekte/[slug]/page.tsx: the same ProjectDetail body rendered in
// English, with its own canonical + hreflang alternates pointing back at the
// German original (which stays x-default). EN content resolves via
// getDetailProject(slug, "en"); the shared ProjectDetail already localizes the
// status labels and the interactive proof off its `locale` prop.
const locale = "en";

// The set of detail-page slugs is locale-invariant, so param generation and
// dynamicParams=false mirror the German route exactly: every other /en/projects/*
// slug is a static 404 rather than a runtime render.
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

  const alternates = alternatesFor("projectDetail", locale, project.slug);
  const keywords = projectKeywords(project);

  return {
    // The layout title template appends the site name: "fuelivo - Yannik Wünker".
    title: project.name,
    description: project.tagline,
    // The project's own tech stack as page keywords, so the per-route metadata is
    // specific to this project rather than the generic site set (parity with the DE twin).
    ...(keywords.length > 0 ? { keywords } : {}),
    authors: [{ name: siteConfig.name, url: siteUrl }],
    alternates: { canonical: alternates.canonical, languages: alternates.languages },
    openGraph: {
      type: "article",
      url: alternates.canonical,
      title: `${project.name} - ${siteConfig.name}`,
      description: project.tagline,
      // og:image comes from the branded card in ./opengraph-image (S5-5); leaving
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

  return (
    <>
      {/* CreativeWork + breadcrumb structured data for this project (S5-5). Kept
          out of generateMetadata because JSON-LD ships in the body, not the head. */}
      <JsonLd data={projectJsonLd(project, locale)} />
      <JsonLd data={projectBreadcrumbJsonLd(project, locale)} />
      <ProjectDetail project={project} locale={locale} />
    </>
  );
}

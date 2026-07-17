import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RelatedPosts } from "@/components/sections/blog/RelatedPosts";
import { RelatedProjects } from "@/components/sections/projects/RelatedProjects";
import { copy } from "@/content/copy";
import { detailProjects } from "@/content/projects";
import { getAllPosts } from "@/lib/content/blog";
import { localizedPath } from "@/lib/i18n/routes";

// The internal-linking footers (S5-2): they turn each detail page into a hub
// instead of a dead end, and must disappear cleanly when there is nothing to link.
describe("RelatedProjects", () => {
  const related = copy.projects.detail.related;

  it("links to each given project by its localized detail path", () => {
    const projects = detailProjects.slice(0, 2);
    expect(projects.length).toBe(2);

    render(<RelatedProjects projects={projects} locale="de" />);

    const nav = screen.getByRole("navigation", { name: related });
    expect(nav).toBeInTheDocument();
    for (const project of projects) {
      const link = screen.getByRole("link", { name: new RegExp(project.name) });
      expect(link).toHaveAttribute("href", localizedPath("projectDetail", "de", project.slug));
    }
  });

  it("renders nothing when there is no sibling project", () => {
    const { container } = render(<RelatedProjects projects={[]} locale="de" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RelatedPosts", () => {
  const related = copy.blog.detail.related;

  it("renders a PostCard link for each given post", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);

    render(<RelatedPosts posts={posts} locale="de" />);

    expect(screen.getByRole("navigation", { name: related })).toBeInTheDocument();
    for (const post of posts) {
      const link = screen.getByRole("link", { name: new RegExp(post.title) });
      expect(link).toHaveAttribute("href", localizedPath("blogPost", "de", post.slug));
    }
  });

  it("links English cards into the /en blog route", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);

    render(<RelatedPosts posts={posts} locale="en" />);

    for (const post of posts) {
      const link = screen.getByRole("link", { name: new RegExp(post.title) });
      expect(link).toHaveAttribute("href", localizedPath("blogPost", "en", post.slug));
    }
  });

  it("renders nothing when there is no other post", () => {
    const { container } = render(<RelatedPosts posts={[]} locale="de" />);
    expect(container).toBeEmptyDOMElement();
  });
});

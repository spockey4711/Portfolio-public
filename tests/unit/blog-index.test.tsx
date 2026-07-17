import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BlogIndexPage from "@/app/(de)/blog/page";
import { copy } from "@/content/copy";
import { getAllPosts } from "@/lib/content/blog";

// The blog index (IA level 2, P3-7): lists every published post and links back to
// the onepager. Rendered directly - it is a sync server component over the
// filesystem-backed registry.
describe("Blog index page", () => {
  const { index } = copy.blog;

  it("renders the index title as the h1 with its intro", () => {
    render(<BlogIndexPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(index.title);
    expect(screen.getByText(index.intro)).toBeInTheDocument();
  });

  it("lists every published post with a link to its page", () => {
    render(<BlogIndexPage />);

    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      const link = screen.getByRole("link", { name: new RegExp(post.title) });
      expect(link).toHaveAttribute("href", `/blog/${post.slug}`);
    }
  });

  it("links back to the onepager", () => {
    render(<BlogIndexPage />);

    expect(screen.getByRole("link", { name: index.backToOnepager.label })).toHaveAttribute(
      "href",
      index.backToOnepager.href,
    );
  });
});

import Link from "next/link";

import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Global MDX element mapping (required by @next/mdx in the App Router). It styles
 * the raw HTML that MDX emits with the design tokens, so a blog post's prose
 * (content/blog/*.mdx) matches the serif-headline / ink-soft-body look of the
 * legal and project-detail pages without the author touching a class name.
 *
 * Only prose elements are mapped; internal links go through next/link for client
 * navigation, external ones fall back to a plain anchor with safe rel. Keeping
 * this list small and semantic is deliberate - a post is prose, not a component
 * playground.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props: ComponentPropsWithoutRef<"h2">) => (
      <h2 className="mt-12 font-serif text-2xl leading-snug text-ink" {...props} />
    ),
    h3: (props: ComponentPropsWithoutRef<"h3">) => (
      <h3 className="mt-10 font-serif text-xl leading-snug text-ink" {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<"p">) => (
      <p className="mt-5 max-w-[68ch] font-sans leading-relaxed text-ink-soft" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<"ul">) => (
      <ul
        className="mt-5 flex max-w-[68ch] list-disc flex-col gap-2 pl-5 font-sans leading-relaxed text-ink-soft"
        {...props}
      />
    ),
    ol: (props: ComponentPropsWithoutRef<"ol">) => (
      <ol
        className="mt-5 flex max-w-[68ch] list-decimal flex-col gap-2 pl-5 font-sans leading-relaxed text-ink-soft"
        {...props}
      />
    ),
    li: (props: ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
    strong: (props: ComponentPropsWithoutRef<"strong">) => (
      <strong className="font-semibold text-ink" {...props} />
    ),
    blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        className="mt-6 max-w-[68ch] border-l-2 border-pine pl-5 font-serif text-lg text-ink-soft italic"
        {...props}
      />
    ),
    code: (props: ComponentPropsWithoutRef<"code">) => (
      <code
        className="rounded-[4px] bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-ink"
        {...props}
      />
    ),
    pre: (props: ComponentPropsWithoutRef<"pre">) => (
      <pre
        className="mt-6 max-w-[68ch] overflow-x-auto rounded-card border border-line bg-surface p-4 font-mono text-sm text-ink"
        {...props}
      />
    ),
    hr: (props: ComponentPropsWithoutRef<"hr">) => (
      <hr className="mt-10 border-t border-line" {...props} />
    ),
    a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
      const isInternal = href.startsWith("/") || href.startsWith("#");
      const className =
        "font-sans text-pine underline underline-offset-4 transition-colors duration-200 hover:text-signal";

      if (isInternal) {
        return <Link href={href} className={className} {...props} />;
      }

      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props} />
      );
    },
    ...components,
  };
}

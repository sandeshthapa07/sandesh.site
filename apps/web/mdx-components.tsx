import type { MDXComponents } from "mdx/types"
import Image, { type ImageProps } from "next/image"
import Link from "next/link"

import { CodeBlock } from "@/components/mdx/code-block"
import { Compare, CompareItem } from "@/components/mdx/compare"
import { Playground } from "@/components/mdx/playground"
import { Video } from "@/components/mdx/video"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Page renders the post title as h1, so body headings start at h2.
    h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    a: ({ href = "", children, ...props }) => {
      if (href.startsWith("/") || href.startsWith("#")) {
        return (
          <Link href={href} {...props}>
            {children}
          </Link>
        )
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    },
    img: (props) => (
      <Image
        sizes="(max-width: 768px) 100vw, 768px"
        width={768}
        height={432}
        style={{ width: "100%", height: "auto" }}
        className="rounded-lg border"
        {...(props as ImageProps)}
      />
    ),
    pre: CodeBlock,
    Compare,
    CompareItem,
    Playground,
    Video,
    ...components,
  }
}

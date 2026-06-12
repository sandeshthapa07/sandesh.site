"use client"

import "@mcp-b/global"
import { useWebMCP } from "@mcp-b/react-webmcp"

import { getPostsIndex, withoutContent } from "@/lib/posts-index"

export default function WebMcpTools() {
  useWebMCP({
    name: "get_profile",
    description:
      "Get Sandesh Thapa's profile: role, company, contact, social links, and selected projects.",
    annotations: { readOnlyHint: true, idempotentHint: true },
    handler: async () => (await getPostsIndex()).profile,
  })

  useWebMCP({
    name: "list_posts",
    description:
      "List all blog posts on this site with title, description, date, tags, and URL.",
    annotations: { readOnlyHint: true, idempotentHint: true },
    handler: async () => (await getPostsIndex()).posts.map(withoutContent),
  })

  useWebMCP({
    name: "get_post",
    description:
      "Get the full plain-text content of a blog post by its slug (use list_posts to find slugs).",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The post slug, e.g. 'building-this-portfolio'",
        },
      },
      required: ["slug"],
    } as const,
    annotations: { readOnlyHint: true, idempotentHint: true },
    handler: async ({ slug }) => {
      const post = (await getPostsIndex()).posts.find((p) => p.slug === slug)
      if (!post) {
        throw new Error(
          `No post found with slug "${slug}". Use list_posts to see available slugs.`,
        )
      }
      return post
    },
  })

  useWebMCP({
    name: "search_posts",
    description:
      "Search blog posts by keyword across titles, descriptions, tags, and body text. Returns matching posts without full content.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword or phrase to search for",
        },
      },
      required: ["query"],
    } as const,
    annotations: { readOnlyHint: true, idempotentHint: true },
    handler: async ({ query }) => {
      const q = query.toLowerCase()
      const matches = (await getPostsIndex()).posts.filter((post) =>
        [post.title, post.description, post.tags.join(" "), post.content]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      return { count: matches.length, posts: matches.map(withoutContent) }
    },
  })

  return null
}

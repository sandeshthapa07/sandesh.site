import "server-only"

import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

export type PostMeta = {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  cover?: string
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

export function getAllPosts(): PostMeta[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readPostMeta(file.replace(/\.mdx$/, "")))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): PostMeta | undefined {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return undefined
  return readPostMeta(slug)
}

export function getAllTags(): string[] {
  const tags = new Set(getAllPosts().flatMap((post) => post.tags))
  return [...tags].sort()
}

/**
 * Raw markdown rendering of a post, used by the "Copy page as Markdown"
 * and "View as Markdown" post actions (and handy for LLMs).
 */
export function getPostMarkdown(slug: string): string | undefined {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return undefined
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  return [
    `# ${data.title}`,
    "",
    `> ${data.description}`,
    "",
    content.trim(),
    "",
  ].join("\n")
}

/**
 * Rough plain-text rendering of a post body for the WebMCP/search index.
 * Strips JSX tags, code fence markers, markdown syntax, and frontmatter.
 */
export function getPostPlainText(slug: string): string {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  const { content } = matter(fs.readFileSync(file, "utf8"))
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```[^\n]*\n?/g, "").trim(),
    )
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function readPostMeta(slug: string): PostMeta {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  const { data } = matter(fs.readFileSync(file, "utf8"))
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    cover: data.cover,
  }
}

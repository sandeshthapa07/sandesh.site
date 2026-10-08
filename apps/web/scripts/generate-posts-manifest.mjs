// Pre-generates content/posts.manifest.json from the .mdx frontmatter so
// lib/posts.ts can read post metadata without touching the filesystem at
// request time (Cloudflare Workers has no real fs at runtime, only at build).
import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

const POSTS_DIR = path.join(process.cwd(), "content", "posts")
const OUT_FILE = path.join(process.cwd(), "content", "posts.manifest.json")

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => {
    const slug = file.replace(/\.mdx$/, "")
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8")
    const { data, content } = matter(raw)
    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "",
      tags: data.tags ?? [],
      cover: data.cover,
      content: content.trim(),
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

fs.writeFileSync(OUT_FILE, `${JSON.stringify(posts, null, 2)}\n`)
console.log(`Wrote ${posts.length} posts to ${path.relative(process.cwd(), OUT_FILE)}`)

import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"

import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"
import { PostListItem } from "@/components/post-list-item"
import { TagBadge } from "@/components/tag-badge"
import { getAllPosts, getAllTags } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on React, Next.js, and things I discover building for the web.",
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const tags = getAllTags()
  const posts = getAllPosts().filter(
    (post) => !tag || post.tags.includes(tag),
  )

  return (
    <PageContainer>
      <PageHeader
        title="Writing"
        description="Things I learn and discover, written down."
      />

      <nav aria-label="Filter posts by tag" className="mt-6">
        <ul className="flex flex-wrap items-center gap-2">
          <li>
            <Badge variant={tag ? "outline" : "default"} render={<Link href="/blog" />}>
              All
            </Badge>
          </li>
          {tags.map((t) => (
            <li key={t}>
              <TagBadge tag={t} active={tag === t} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 grid gap-1">
        {posts.length > 0 ? (
          posts.map((post) => <PostListItem key={post.slug} post={post} />)
        ) : (
          <p className="text-muted-foreground">No posts found for this tag.</p>
        )}
      </div>
    </PageContainer>
  )
}

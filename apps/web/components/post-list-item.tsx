import { ViewTransition } from "react"
import Link from "next/link"

import type { PostMeta } from "@/lib/posts"
import { formatDate } from "@/lib/format"

/** Tiny document thumbnail with placeholder text lines. */
function DocThumbnail() {
  return (
    <span
      aria-hidden
      className="flex size-11 shrink-0 flex-col justify-center gap-1 rounded-lg border bg-card px-2.5 shadow-xs transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
    >
      <span className="h-0.5 w-full rounded-full bg-border" />
      <span className="h-0.5 w-4/5 rounded-full bg-border" />
      <span className="h-0.5 w-full rounded-full bg-border" />
      <span className="h-0.5 w-3/5 rounded-full bg-border" />
    </span>
  )
}

export function PostListItem({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group -mx-3 flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60"
    >
      <DocThumbnail />
      <span className="min-w-0">
        <ViewTransition name={`post-title-${post.slug}`}>
          <span className="block truncate font-medium">{post.title}</span>
        </ViewTransition>
        <time
          dateTime={post.date}
          className="block text-sm text-muted-foreground"
        >
          {formatDate(post.date)}
        </time>
      </span>
    </Link>
  )
}

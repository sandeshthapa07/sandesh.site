"use client"

export type PostIndexEntry = {
  slug: string
  url: string
  title: string
  description: string
  date: string
  tags: string[]
  content: string
}

export type PostsIndex = {
  profile: Record<string, unknown>
  posts: PostIndexEntry[]
}

let indexPromise: Promise<PostsIndex> | null = null

/** Fetches the build-time /posts.json index once and memoizes it. */
export function getPostsIndex(): Promise<PostsIndex> {
  indexPromise ??= fetch("/posts.json").then((res) => {
    if (!res.ok) {
      indexPromise = null
      throw new Error(`Failed to load posts index (${res.status})`)
    }
    return res.json()
  })
  return indexPromise
}

export function withoutContent(post: PostIndexEntry) {
  const meta = { ...post } as Partial<PostIndexEntry>
  delete meta.content
  return meta
}

import { ViewTransition } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Separator } from "@workspace/ui/components/separator"

import { NewsletterForm } from "@/components/newsletter-form"
import { PageContainer } from "@/components/page-container"
import { PostActions } from "@/components/post-actions"
import { TagBadge } from "@/components/tag-badge"
import { formatDate } from "@/lib/format"
import { getAllPosts, getPost, getPostPlainText } from "@/lib/posts"
import { site } from "@/lib/site"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [site.name],
      tags: [...post.tags],
    },
  }
}

function readingTime(text: string): number {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function ReadNextCard({
  slug,
  direction,
}: {
  slug: string
  direction: "Previous" | "Next"
}) {
  const post = getPost(slug)
  if (!post) return null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card-lift group flex flex-col gap-1 rounded-2xl border bg-card p-4 shadow-xs"
    >
      <span className="text-xs text-muted-foreground">{direction} post</span>
      <span className="font-medium leading-snug group-hover:underline group-hover:underline-offset-4">
        {post.title}
      </span>
      <time dateTime={post.date} className="mt-auto pt-2 text-xs text-muted-foreground">
        {formatDate(post.date)}
      </time>
    </Link>
  )
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const { default: PostBody } = await import(`@/content/posts/${slug}.mdx`)
  const plainText = getPostPlainText(slug)

  // Adjacent posts for the "Read next" cards (posts are sorted newest first).
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.slug === slug)
  const newer = index > 0 ? posts[index - 1] : undefined
  const older = index < posts.length - 1 ? posts[index + 1] : undefined

  return (
    <PageContainer as="article">
      <header>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{readingTime(plainText)} min read</span>
          </div>
          <PostActions
            slug={post.slug}
            title={post.title}
            text={plainText}
            cover={post.cover}
          />
        </div>
        <ViewTransition name={`post-title-${post.slug}`}>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
            {post.title}
          </h1>
        </ViewTransition>
        <p className="mt-3 text-muted-foreground">{post.description}</p>
      </header>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-lg prose-h3:text-base prose-a:font-normal prose-a:underline-offset-4 prose-img:rounded-lg">
        <PostBody />
      </div>

      {post.tags.length > 0 ? (
        <ul className="mt-10 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <li key={tag}>
              <TagBadge tag={tag} />
            </li>
          ))}
        </ul>
      ) : null}

      <Separator className="my-12" />

      <section aria-label="Subscribe">
        <h2 className="font-medium">Enjoyed this post?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscribe to get future posts straight to your inbox.
        </p>
        <NewsletterForm />
      </section>

      {newer || older ? (
        <nav
          aria-label="More posts"
          className="mt-12 grid gap-4 sm:grid-cols-2"
        >
          {older ? <ReadNextCard slug={older.slug} direction="Previous" /> : null}
          {newer ? <ReadNextCard slug={newer.slug} direction="Next" /> : null}
        </nav>
      ) : null}
    </PageContainer>
  )
}

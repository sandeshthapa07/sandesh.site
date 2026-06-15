import { and, eq, sql } from "drizzle-orm"

import { db } from "@workspace/db"
import { postLikes, postStats } from "@workspace/db/schema"
import { getPost } from "@/lib/posts"

export const dynamic = "force-dynamic"

const MAX_LIKES = 20

type Params = { params: Promise<{ slug: string }> }

function getIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 })

  const ip = getIP(request)

  // Check current like count for this IP
  const [existing] = await db()
    .select({ count: postLikes.count })
    .from(postLikes)
    .where(and(eq(postLikes.slug, slug), eq(postLikes.ip, ip)))

  const currentUserLikes = existing?.count ?? 0

  if (currentUserLikes >= MAX_LIKES) {
    const [stats] = await db()
      .select()
      .from(postStats)
      .where(eq(postStats.slug, slug))
    return Response.json({
      views: stats?.views ?? 0,
      likes: stats?.likes ?? 0,
      userLikes: currentUserLikes,
    })
  }

  // Upsert user like count
  const [likeRow] = await db()
    .insert(postLikes)
    .values({ slug, ip, count: 1 })
    .onConflictDoUpdate({
      target: [postLikes.slug, postLikes.ip],
      set: {
        count: sql`${postLikes.count} + 1`,
        updatedAt: sql`now()`,
      },
    })
    .returning()

  // Increment total post likes
  const [statsRow] = await db()
    .insert(postStats)
    .values({ slug, likes: 1 })
    .onConflictDoUpdate({
      target: postStats.slug,
      set: { likes: sql`${postStats.likes} + 1` },
    })
    .returning()

  return Response.json({
    views: statsRow?.views ?? 0,
    likes: statsRow?.likes ?? 0,
    userLikes: likeRow?.count ?? 1,
  })
}

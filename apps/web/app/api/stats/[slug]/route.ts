import { and, eq, sql } from "drizzle-orm"

import { db } from "@workspace/db"
import { postLikes, postStats } from "@workspace/db/schema"
import { getPost } from "@/lib/posts"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ slug: string }> }

function getIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 })

  const ip = getIP(request)

  const [statsResult, likeResult] = await Promise.all([
    db().select().from(postStats).where(eq(postStats.slug, slug)),
    db()
      .select({ count: postLikes.count })
      .from(postLikes)
      .where(and(eq(postLikes.slug, slug), eq(postLikes.ip, ip))),
  ])

  return Response.json({
    views: statsResult[0]?.views ?? 0,
    likes: statsResult[0]?.likes ?? 0,
    userLikes: likeResult[0]?.count ?? 0,
  })
}

/** Record one view and return updated stats. */
export async function POST(request: Request, { params }: Params) {
  const { slug } = await params
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 })

  const ip = getIP(request)

  const [statsRow, likeResult] = await Promise.all([
    db()
      .insert(postStats)
      .values({ slug, views: 1 })
      .onConflictDoUpdate({
        target: postStats.slug,
        set: { views: sql`${postStats.views} + 1` },
      })
      .returning(),
    db()
      .select({ count: postLikes.count })
      .from(postLikes)
      .where(and(eq(postLikes.slug, slug), eq(postLikes.ip, ip))),
  ])

  return Response.json({
    views: statsRow[0]?.views ?? 0,
    likes: statsRow[0]?.likes ?? 0,
    userLikes: likeResult[0]?.count ?? 0,
  })
}

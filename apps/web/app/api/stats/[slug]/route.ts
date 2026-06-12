import { sql } from "drizzle-orm"

import { db } from "@workspace/db"
import { postStats } from "@workspace/db/schema"
import { getPost } from "@/lib/posts"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 })

  const [row] = await db()
    .select()
    .from(postStats)
    .where(sql`${postStats.slug} = ${slug}`)
  return Response.json({ views: row?.views ?? 0, likes: row?.likes ?? 0 })
}

/** Record one view and return the updated stats. */
export async function POST(_request: Request, { params }: Params) {
  const { slug } = await params
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 })

  const [row] = await db()
    .insert(postStats)
    .values({ slug, views: 1 })
    .onConflictDoUpdate({
      target: postStats.slug,
      set: { views: sql`${postStats.views} + 1` },
    })
    .returning()
  return Response.json({ views: row!.views, likes: row!.likes })
}

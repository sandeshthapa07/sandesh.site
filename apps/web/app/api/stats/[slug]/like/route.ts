import { sql } from "drizzle-orm"

import { db } from "@workspace/db"
import { postStats } from "@workspace/db/schema"
import { getPost } from "@/lib/posts"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ slug: string }> }

export async function POST(_request: Request, { params }: Params) {
  const { slug } = await params
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 })

  const [row] = await db()
    .insert(postStats)
    .values({ slug, likes: 1 })
    .onConflictDoUpdate({
      target: postStats.slug,
      set: { likes: sql`${postStats.likes} + 1` },
    })
    .returning()
  return Response.json({ views: row!.views, likes: row!.likes })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug } = await params
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 })

  const [row] = await db()
    .update(postStats)
    .set({ likes: sql`greatest(${postStats.likes} - 1, 0)` })
    .where(sql`${postStats.slug} = ${slug}`)
    .returning()
  return Response.json({ views: row?.views ?? 0, likes: row?.likes ?? 0 })
}

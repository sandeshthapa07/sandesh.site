import { ImageResponse } from "next/og"

import { getAllPosts, getPost } from "@/lib/posts"
import { site } from "@/lib/site"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Blog post cover"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 96,
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1.15,
          }}
        >
          {post?.title ?? "Blog"}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 32, color: "#a1a1aa" }}>{site.name}</div>
          <div style={{ fontSize: 32, color: "#a1a1aa" }}>{post?.date}</div>
        </div>
      </div>
    ),
    size,
  )
}

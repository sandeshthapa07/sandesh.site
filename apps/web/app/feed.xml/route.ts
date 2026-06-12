import { getAllPosts } from "@/lib/posts"
import { site } from "@/lib/site"

export const dynamic = "force-static"

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function GET() {
  const items = getAllPosts()
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.url}/blog/${post.slug}</link>
      <guid>${site.url}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n")

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — Blog`)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}

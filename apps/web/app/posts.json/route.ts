import { getAllPosts, getPostPlainText } from "@/lib/posts"
import { projects, site } from "@/lib/site"

export const dynamic = "force-static"

export function GET() {
  const posts = getAllPosts().map((post) => ({
    ...post,
    url: `${site.url}/blog/${post.slug}`,
    content: getPostPlainText(post.slug),
  }))

  return Response.json({
    profile: {
      name: site.name,
      role: site.role,
      company: site.company,
      email: site.email,
      url: site.url,
      description: site.description,
      socials: site.socials,
      projects,
    },
    posts,
  })
}

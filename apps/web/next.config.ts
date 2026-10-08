import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image only — OpenNext
  // (Cloudflare Workers build) is incompatible with standalone output.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  transpilePackages: ["@workspace/ui", "@workspace/db"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
}

// Turbopack requires plugins as string identifiers with serializable options.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      [
        "rehype-pretty-code",
        {
          theme: {
            light: "github-light-default",
            dark: "github-dark-default",
          },
          keepBackground: false,
          defaultLang: "plaintext",
        },
      ],
    ],
  },
})

export default withMDX(nextConfig)

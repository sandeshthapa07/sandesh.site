import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
  transpilePackages: ["@workspace/ui", "@workspace/db"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  experimental: {
    viewTransition: true,
  },
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

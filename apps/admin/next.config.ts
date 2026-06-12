import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
  transpilePackages: ["@workspace/ui", "@workspace/db"],
}

export default nextConfig

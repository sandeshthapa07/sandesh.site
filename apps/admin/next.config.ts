import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image only — OpenNext
  // (Cloudflare Workers build) is incompatible with standalone output.
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  transpilePackages: ["@workspace/ui", "@workspace/db"],
}

export default nextConfig

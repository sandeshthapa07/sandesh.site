"use client"

import dynamic from "next/dynamic"

// WebMCP touches navigator/document at module scope, so it must never run
// during SSR. Loading it lazily also keeps it out of the critical bundle.
const WebMcpTools = dynamic(() => import("./webmcp-tools"), { ssr: false })

export function WebMcpProvider() {
  return <WebMcpTools />
}

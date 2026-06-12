import { ImageResponse } from "next/og"

import { site } from "@/lib/site"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = `${site.name} — ${site.role}`

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: -2 }}>
          {site.name}
        </div>
        <div style={{ marginTop: 16, fontSize: 36, color: "#a1a1aa" }}>
          {`${site.role} at ${site.company}`}
        </div>
      </div>
    ),
    size,
  )
}

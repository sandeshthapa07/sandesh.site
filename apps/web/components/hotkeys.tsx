"use client"

import { useRouter } from "next/navigation"
import { useHotkeySequences } from "@tanstack/react-hotkeys"

import { site } from "@/lib/site"

/** Vim-style "g then …" navigation shortcuts, registered globally. */
export function GlobalHotkeys() {
  const router = useRouter()

  useHotkeySequences(
    site.nav.map((item) => ({
      sequence: ["G", item.key],
      callback: () => router.push(item.href),
    })),
  )

  return null
}

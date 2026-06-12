import type { Metadata } from "next"
import { WifiOff } from "lucide-react"

import { PageContainer } from "@/components/page-container"

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false },
}

export default function OfflinePage() {
  return (
    <PageContainer className="flex flex-col items-center text-center">
      <WifiOff aria-hidden className="size-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        This page isn&apos;t cached yet. Pages you&apos;ve visited before are
        still available — try going back, or reconnect to load new content.
      </p>
    </PageContainer>
  )
}

import { Caveat } from "next/font/google"
import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

import { site } from "@/lib/site"

const signatureFont = Caveat({ subsets: ["latin"], weight: "600" })

export function SiteFooter() {
  const domain = site.url.replace(/^https?:\/\//, "")

  return (
    <footer>
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {domain}
        </Link>
        <Link
          href="/about"
          aria-label={`About ${site.name}`}
          className={cn(
            signatureFont.className,
            "text-2xl text-foreground/60 transition-colors hover:text-foreground",
          )}
        >
          <span aria-hidden>Sandesh</span>
        </Link>
      </div>
    </footer>
  )
}

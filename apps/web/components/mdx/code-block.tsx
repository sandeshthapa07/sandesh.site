"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"pre">) {
  const preRef = React.useRef<HTMLPreElement>(null)
  const resetTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => () => clearTimeout(resetTimer.current), [])

  async function copy() {
    const code = preRef.current?.querySelector("code")?.innerText
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — leave the code selectable.
    }
  }

  return (
    <pre ref={preRef} className={cn("group/pre relative", className)} {...props}>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy code"}
        onClick={copy}
        className="absolute top-2 right-2 rounded-md border bg-background/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/pre:opacity-100 motion-reduce:transition-none"
      >
        {copied ? (
          <Check aria-hidden className="size-4 text-green-600 dark:text-green-500" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
      </button>
      {children}
    </pre>
  )
}

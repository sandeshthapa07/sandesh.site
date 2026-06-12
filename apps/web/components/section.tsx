import type { CSSProperties } from "react"

import { cn } from "@workspace/ui/lib/utils"

type SectionProps = React.ComponentProps<"section"> & {
  title: string
  /** Index for the staggered reveal animation; omit to disable. */
  revealIndex?: number
  /** Rendered on the same row as the title, aligned to the end. */
  action?: React.ReactNode
}

export function Section({
  title,
  revealIndex,
  action,
  className,
  children,
  ...props
}: SectionProps) {
  const headingId = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
  return (
    <section
      aria-labelledby={headingId}
      className={cn(revealIndex !== undefined && "reveal", className)}
      style={
        revealIndex !== undefined
          ? ({ "--reveal-i": revealIndex } as CSSProperties)
          : undefined
      }
      {...props}
    >
      <div className="flex items-baseline justify-between">
        <h2 id={headingId} className="text-[15px] font-medium">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

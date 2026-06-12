"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

/**
 * External link that shows an OG-style screenshot of the target site in a
 * tooltip on hover. Screenshots come from the free WordPress mshots service,
 * so no API key is needed; the first hover may show a placeholder while the
 * screenshot is generated, after which it is cached.
 */
export function LinkPreview({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const domain = new URL(href).hostname.replace(/^www\./, "")
  const preview = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(href)}?w=480&h=300`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent sideOffset={8} className="flex-col items-stretch gap-1 p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote screenshot service, skip the optimizer */}
        <img
          src={preview}
          alt={`Preview of ${domain}`}
          width={224}
          height={140}
          loading="lazy"
          className="aspect-[8/5] w-56 rounded-sm bg-background/20 object-cover"
        />
        <span className="px-1 pb-0.5 text-[11px] text-background/70">
          {domain}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

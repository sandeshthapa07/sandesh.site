import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"

export function TagBadge({
  tag,
  active = false,
}: {
  tag: string
  active?: boolean
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      render={
        <Link
          href={`/blog?tag=${encodeURIComponent(tag)}`}
          aria-current={active ? "page" : undefined}
        />
      }
    >
      {tag}
    </Badge>
  )
}

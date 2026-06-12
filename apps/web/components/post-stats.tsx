"use client"

import * as React from "react"
import { Heart } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Views + like button for a post. Records one view per browser session and
 * remembers likes in localStorage so the buttons stay honest across visits.
 */
export function PostStats({ slug }: { slug: string }) {
  const [views, setViews] = React.useState<number | null>(null)
  const [likes, setLikes] = React.useState(0)
  const [liked, setLiked] = React.useState(false)

  React.useEffect(() => {
    const viewedKey = `viewed:${slug}`
    const alreadyViewed = sessionStorage.getItem(viewedKey) === "1"
    const request = alreadyViewed
      ? fetch(`/api/stats/${slug}`)
      : fetch(`/api/stats/${slug}`, { method: "POST" })
    request
      .then((res) => (res.ok ? res.json() : null))
      .then((stats: { views: number; likes: number } | null) => {
        if (!stats) return
        sessionStorage.setItem(viewedKey, "1")
        setViews(stats.views)
        setLikes(stats.likes)
        setLiked(localStorage.getItem(`liked:${slug}`) === "1")
      })
      .catch(() => {
        // Stats are decorative — fail silently.
      })
  }, [slug])

  function toggleLike() {
    const next = !liked
    setLiked(next)
    setLikes((count) => Math.max(0, count + (next ? 1 : -1)))
    localStorage.setItem(`liked:${slug}`, next ? "1" : "0")
    fetch(`/api/stats/${slug}/like`, { method: next ? "POST" : "DELETE" }).catch(
      () => {
        // Keep the optimistic state; the count self-corrects on next load.
      },
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
      <span aria-live="polite">
        {views === null ? "–" : views} {views === 1 ? "view" : "views"}
      </span>
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? "Remove like" : "Like this post"}
        className="group flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 transition-colors hover:border-red-300 hover:text-red-500"
      >
        <Heart
          aria-hidden
          className={cn(
            "size-3.5 transition-transform group-active:scale-125",
            liked && "fill-red-500 text-red-500",
          )}
        />
        {likes}
      </button>
    </div>
  )
}

"use client"

import * as React from "react"
import { Heart } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

const MAX_LIKES = 20

const MILESTONES: Record<number, string> = {
  5: "×5 🔥",
  10: "×10 💫",
  15: "×15 ⚡",
  20: "Max! 🎉",
}

interface Floater {
  id: number
  x: number
}

export function PostStats({ slug }: Readonly<{ slug: string }>) {
  const [views, setViews] = React.useState<number | null>(null)
  const [likes, setLikes] = React.useState(0)
  const [userLikes, setUserLikes] = React.useState(0)
  const [heartAnim, setHeartAnim] = React.useState<"pop" | "burst" | null>(null)
  const [floaters, setFloaters] = React.useState<Floater[]>([])
  const [achievement, setAchievement] = React.useState<string | null>(null)
  const floaterCounter = React.useRef(0)
  const achievementTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    const viewedKey = `viewed:${slug}`
    const alreadyViewed = sessionStorage.getItem(viewedKey) === "1"
    const request = alreadyViewed
      ? fetch(`/api/stats/${slug}`)
      : fetch(`/api/stats/${slug}`, { method: "POST" })

    request
      .then((res) => (res.ok ? res.json() : null))
      .then((stats: { views: number; likes: number; userLikes: number } | null) => {
        if (!stats) return
        sessionStorage.setItem(viewedKey, "1")
        setViews(stats.views)
        setLikes(stats.likes)
        setUserLikes(stats.userLikes)
      })
      .catch(() => {
        // Stats are decorative — fail silently.
      })
  }, [slug])

  React.useEffect(() => () => clearTimeout(achievementTimer.current), [])

  async function handleLike() {
    if (userLikes >= MAX_LIKES) return

    const next = userLikes + 1

    // Optimistic UI
    setUserLikes(next)
    setLikes((l) => l + 1)

    // Heart animation — burst on milestones, pop otherwise
    const isMilestone = next in MILESTONES
    setHeartAnim(isMilestone ? "burst" : "pop")
    setTimeout(() => setHeartAnim(null), isMilestone ? 450 : 350)

    // Float-up "+1" particle with a small random horizontal offset
    const id = ++floaterCounter.current
    const x = Math.round(Math.random() * 28 - 14)
    setFloaters((f) => [...f, { id, x }])
    setTimeout(() => setFloaters((f) => f.filter((p) => p.id !== id)), 700)

    // Milestone achievement badge
    if (isMilestone) {
      clearTimeout(achievementTimer.current)
      setAchievement(MILESTONES[next]!)
      achievementTimer.current = setTimeout(() => setAchievement(null), 2200)
    }

    // Persist to server
    try {
      const res = await fetch(`/api/stats/${slug}/like`, { method: "POST" })
      if (res.ok) {
        const data = (await res.json()) as { views: number; likes: number; userLikes: number }
        setLikes(data.likes)
        setUserLikes(data.userLikes)
      }
    } catch {
      // Keep optimistic state; corrects on next page load.
    }
  }

  const hasLiked = userLikes > 0
  const isMaxed = userLikes >= MAX_LIKES

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
      <span aria-live="polite">
        {views === null ? "–" : views.toLocaleString("en-US")}{" "}
        {views === 1 ? "view" : "views"}
      </span>

      {/* Like button wrapper — position:relative anchors the floaters */}
      <div className="relative">
        {/* Floating "+1" particles */}
        {floaters.map((f) => (
          <span
            key={f.id}
            className="animate-float-up pointer-events-none absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 text-[11px] font-semibold text-red-500"
            style={{ marginLeft: f.x }}
            aria-hidden
          >
            +1
          </span>
        ))}

        {/* Milestone achievement badge */}
        {achievement ? (
          <span
            className="animate-reveal pointer-events-none absolute bottom-full left-1/2 mb-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-semibold text-background"
            aria-live="assertive"
          >
            {achievement}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleLike}
          disabled={isMaxed}
          aria-label={
            isMaxed
              ? "Maximum likes reached"
              : `Like this post — ${userLikes} of ${MAX_LIKES} likes used`
          }
          className={cn(
            "group flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 transition-colors duration-150",
            !isMaxed && !hasLiked && "hover:border-red-300 hover:text-red-500",
            hasLiked && !isMaxed && "border-red-200 text-red-500 hover:border-red-400",
            isMaxed && "cursor-default border-red-300 text-red-500",
          )}
        >
          <Heart
            aria-hidden
            className={cn(
              "size-3.5",
              hasLiked && "fill-red-500 text-red-500",
              heartAnim === "pop" && "animate-heart-pop",
              heartAnim === "burst" && "animate-milestone-burst",
            )}
          />
          <span>{likes.toLocaleString("en-US")}</span>
          {userLikes > 0 ? (
            <span
              className={cn(
                "text-[10px] tabular-nums leading-none",
                isMaxed ? "text-red-400" : "text-red-300",
              )}
            >
              {userLikes}/{MAX_LIKES}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@workspace/ui/components/button"

import { site } from "@/lib/site"

/**
 * No mailing-list backend yet: subscribing opens a pre-filled email so
 * subscribers land in the inbox until a provider is wired up.
 */
export function NewsletterForm() {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get("email")
    const subject = encodeURIComponent("Subscribe me to your posts")
    const body = encodeURIComponent(`Hi Sandesh, please add ${email} to your list.`)
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="flex items-center gap-2 rounded-full border bg-card p-1.5 pl-4 shadow-xs focus-within:ring-2 focus-within:ring-ring/40">
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com..."
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" className="rounded-full px-4">
          Subscribe
        </Button>
      </div>
    </form>
  )
}

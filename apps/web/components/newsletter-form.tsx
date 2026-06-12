"use client"

import * as React from "react"

import { Button } from "@workspace/ui/components/button"

import {
  subscribeToNewsletter,
  type SubscribeState,
} from "@/app/actions"

const initialState: SubscribeState = { status: "idle" }

export function NewsletterForm() {
  const [state, action, pending] = React.useActionState(
    subscribeToNewsletter,
    initialState,
  )

  if (state.status === "success") {
    return (
      <p role="status" className="mt-4 text-sm">
        <span className="font-medium">You&apos;re in!</span>{" "}
        <span className="text-muted-foreground">
          New posts will land in your inbox.
        </span>
      </p>
    )
  }

  return (
    <form action={action} className="mt-4">
      <div className="flex items-center gap-2 rounded-full border bg-card p-1.5 pl-4 shadow-xs focus-within:ring-2 focus-within:ring-ring/40">
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com..."
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" disabled={pending} className="rounded-full px-4">
          {pending ? "…" : "Subscribe"}
        </Button>
      </div>
      {state.status === "error" ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}

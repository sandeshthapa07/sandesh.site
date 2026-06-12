"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

import { submitContact, type ContactFormState } from "./actions"

const initialState: ContactFormState = { status: "idle" }

export function ContactForm() {
  const [state, action, pending] = React.useActionState(
    submitContact,
    initialState,
  )

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="mt-8 flex items-start gap-3 rounded-xl border bg-card p-4"
      >
        <CheckCircle2 aria-hidden className="mt-0.5 size-5 text-green-500" />
        <div>
          <p className="font-medium">Message sent</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Thanks for reaching out — I&apos;ll get back to you soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Name</span>
          <Input name="name" required maxLength={200} placeholder="Your name" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <Input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Message</span>
        <Textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="What's on your mind?"
        />
      </label>
      {/* Honeypot — hidden from real users, bots fill it in. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}

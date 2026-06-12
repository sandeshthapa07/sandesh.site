"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"

import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  async function signOut() {
    setPending(true)
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" disabled={pending} onClick={signOut}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  )
}

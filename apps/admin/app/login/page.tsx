import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

import { SignInButtons } from "./sign-in-buttons"

export const metadata: Metadata = {
  title: "Sign in",
}

export const dynamic = "force-dynamic"

const errorMessages: Record<string, string> = {
  forbidden: "This account is not allowed to access the admin panel.",
  auth: "Sign-in failed — please try again.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth().api.getSession({ headers: await headers() })
  if (session) redirect("/")

  const { error } = await searchParams

  return (
    <div className="mx-auto flex min-h-svh max-w-xs flex-col justify-center px-5 py-24">
      <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to manage messages, subscribers and post insights.
      </p>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {errorMessages[error] ?? errorMessages.auth}
        </p>
      ) : null}
      <SignInButtons />
    </div>
  )
}

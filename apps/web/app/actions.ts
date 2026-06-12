"use server"

import { z } from "zod"

import { db } from "@workspace/db"
import { newsletterSubscribers } from "@workspace/db/schema"

export type SubscribeState = {
  status: "idle" | "success" | "error"
  error?: string
}

export async function subscribeToNewsletter(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const parsed = z
    .string()
    .trim()
    .email()
    .safeParse(formData.get("email"))
  if (!parsed.success) {
    return { status: "error", error: "Please enter a valid email address." }
  }

  try {
    await db()
      .insert(newsletterSubscribers)
      .values({ email: parsed.data.toLowerCase() })
      .onConflictDoNothing()
    return { status: "success" }
  } catch (error) {
    console.error("Failed to save subscriber", error)
    return {
      status: "error",
      error: "Something went wrong — please try again later.",
    }
  }
}

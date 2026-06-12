"use server"

import { z } from "zod"

import { db } from "@workspace/db"
import { contactMessages } from "@workspace/db/schema"

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(200),
  email: z.string().trim().email("Please enter a valid email"),
  message: z.string().trim().min(10, "Tell me a bit more — at least 10 characters").max(5000),
})

export type ContactFormState = {
  status: "idle" | "success" | "error"
  error?: string
}

export async function submitContact(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: hidden field real users never fill in.
  if (formData.get("company")) {
    return { status: "success" }
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  })
  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  try {
    await db().insert(contactMessages).values(parsed.data)
    return { status: "success" }
  } catch (error) {
    console.error("Failed to save contact message", error)
    return {
      status: "error",
      error: "Something went wrong on my end — please try again later.",
    }
  }
}

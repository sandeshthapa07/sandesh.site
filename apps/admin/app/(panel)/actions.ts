"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { db } from "@workspace/db"
import { contactMessages, newsletterSubscribers } from "@workspace/db/schema"

import { requireAdmin } from "@/lib/session"

export async function setMessageRead(id: number, read: boolean): Promise<void> {
  await requireAdmin()
  await db()
    .update(contactMessages)
    .set({ read })
    .where(eq(contactMessages.id, id))
  revalidatePath("/messages")
  revalidatePath("/")
}

export async function deleteMessage(id: number): Promise<void> {
  await requireAdmin()
  await db().delete(contactMessages).where(eq(contactMessages.id, id))
  revalidatePath("/messages")
  revalidatePath("/")
}

export async function deleteSubscriber(id: number): Promise<void> {
  await requireAdmin()
  await db()
    .delete(newsletterSubscribers)
    .where(eq(newsletterSubscribers.id, id))
  revalidatePath("/subscribers")
  revalidatePath("/")
}

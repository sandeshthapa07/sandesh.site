import { desc } from "drizzle-orm"

import { Button } from "@workspace/ui/components/button"
import { db } from "@workspace/db"
import { newsletterSubscribers } from "@workspace/db/schema"

import { formatDate } from "@/lib/format"

import { deleteSubscriber } from "../actions"

export const dynamic = "force-dynamic"

export const metadata = { title: "Subscribers" }

export default async function SubscribersPage() {
  const subscribers = await db()
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt))

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">
        Subscribers{" "}
        <span className="text-base font-normal text-muted-foreground">
          ({subscribers.length})
        </span>
      </h1>
      {subscribers.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No subscribers yet.</p>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {subscribers.map((subscriber) => (
            <li
              key={subscriber.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="truncate text-sm">{subscriber.email}</span>
              <span className="flex shrink-0 items-center gap-3">
                <time
                  dateTime={subscriber.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(subscriber.createdAt.toISOString())}
                </time>
                <form action={deleteSubscriber.bind(null, subscriber.id)}>
                  <Button type="submit" variant="ghost" size="xs">
                    Remove
                  </Button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

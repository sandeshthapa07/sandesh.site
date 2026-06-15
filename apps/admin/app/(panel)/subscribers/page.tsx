import { count, desc, gt, sql } from "drizzle-orm"

import { Button } from "@workspace/ui/components/button"
import { db } from "@workspace/db"
import { newsletterSubscribers } from "@workspace/db/schema"

import { formatDate } from "@/lib/format"

import { deleteSubscriber } from "../actions"

export const dynamic = "force-dynamic"

export const metadata = { title: "Subscribers" }

export default async function SubscribersPage() {
  const [subscribers, [newThisMonth]] = await Promise.all([
    db()
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt)),
    db()
      .select({ value: count() })
      .from(newsletterSubscribers)
      .where(
        gt(
          newsletterSubscribers.createdAt,
          sql`now() - interval '30 days'`,
        ),
      ),
  ])

  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Subscribers</h1>
        <div className="flex items-baseline gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {subscribers.length.toLocaleString("en-US")} total
          </span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">
            +{(newThisMonth?.value ?? 0).toLocaleString("en-US")} this month
          </span>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No subscribers yet.</p>
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

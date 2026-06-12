import Link from "next/link"
import { count, desc, eq, gt, sql, sum } from "drizzle-orm"

import { Badge } from "@workspace/ui/components/badge"
import { db } from "@workspace/db"
import {
  contactMessages,
  newsletterSubscribers,
  postStats,
} from "@workspace/db/schema"

import { formatDate } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [
    [messages],
    [unread],
    [subscribers],
    [newSubscribers],
    [totals],
    topPosts,
    recentMessages,
    recentSubscribers,
  ] = await Promise.all([
    db().select({ value: count() }).from(contactMessages),
    db()
      .select({ value: count() })
      .from(contactMessages)
      .where(eq(contactMessages.read, false)),
    db().select({ value: count() }).from(newsletterSubscribers),
    db()
      .select({ value: count() })
      .from(newsletterSubscribers)
      .where(gt(newsletterSubscribers.createdAt, sql`now() - interval '30 days'`)),
    db()
      .select({ views: sum(postStats.views), likes: sum(postStats.likes) })
      .from(postStats),
    db()
      .select()
      .from(postStats)
      .orderBy(desc(postStats.views))
      .limit(10),
    db()
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(5),
    db()
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt))
      .limit(5),
  ])

  const totalViews = Number(totals?.views ?? 0)
  const totalLikes = Number(totals?.likes ?? 0)
  const maxViews = Math.max(...topPosts.map((post) => post.views), 1)

  const cards = [
    { label: "Post views", value: totalViews },
    { label: "Post likes", value: totalLikes },
    {
      label: "Subscribers",
      value: subscribers?.value ?? 0,
      hint: `+${newSubscribers?.value ?? 0} in the last 30 days`,
      href: "/subscribers",
    },
    {
      label: "Messages",
      value: messages?.value ?? 0,
      hint: `${unread?.value ?? 0} unread`,
      href: "/messages",
    },
  ]

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Insights</h1>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const body = (
            <div className="h-full rounded-xl border bg-card p-4">
              <dt className="text-sm text-muted-foreground">{card.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {card.value.toLocaleString("en-US")}
              </dd>
              {card.hint ? (
                <dd className="mt-1 text-xs text-muted-foreground">
                  {card.hint}
                </dd>
              ) : null}
            </div>
          )
          return card.href ? (
            <Link key={card.label} href={card.href} className="block">
              {body}
            </Link>
          ) : (
            <div key={card.label}>{body}</div>
          )
        })}
      </dl>

      <section className="mt-10">
        <h2 className="text-base font-semibold tracking-tight">Top posts</h2>
        {topPosts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No post stats yet.</p>
        ) : (
          <ul className="mt-4 space-y-3 rounded-xl border bg-card p-4">
            {topPosts.map((post) => (
              <li key={post.slug}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{post.slug}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {post.views.toLocaleString("en-US")} views ·{" "}
                    {post.likes.toLocaleString("en-US")} likes
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/70"
                    style={{ width: `${Math.max((post.views / maxViews) * 100, 2)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Recent messages
          </h2>
          {recentMessages.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="mt-4 divide-y rounded-xl border bg-card">
              {recentMessages.map((message) => (
                <li key={message.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {message.name}
                      {!message.read ? <Badge>New</Badge> : null}
                    </span>
                    <time
                      dateTime={message.createdAt.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDate(message.createdAt.toISOString())}
                    </time>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {message.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/messages"
            className="mt-3 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            All messages →
          </Link>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            New subscribers
          </h2>
          {recentSubscribers.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No subscribers yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y rounded-xl border bg-card">
              {recentSubscribers.map((subscriber) => (
                <li
                  key={subscriber.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="truncate text-sm">{subscriber.email}</span>
                  <time
                    dateTime={subscriber.createdAt.toISOString()}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {formatDate(subscriber.createdAt.toISOString())}
                  </time>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/subscribers"
            className="mt-3 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            All subscribers →
          </Link>
        </section>
      </div>
    </>
  )
}

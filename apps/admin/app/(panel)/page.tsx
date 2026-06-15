import Link from "next/link"
import { count, desc, eq, gt, sql, sum } from "drizzle-orm"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
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
      .where(
        gt(
          newsletterSubscribers.createdAt,
          sql`now() - interval '30 days'`,
        ),
      ),
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
  const maxViews = Math.max(...topPosts.map((p) => p.views), 1)
  const engagementRate =
    totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : "—"
  const unreadCount = unread?.value ?? 0
  const newSubCount = newSubscribers?.value ?? 0

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Overview</h1>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total views" value={fmt(totalViews)} />
        <StatCard
          label="Total likes"
          value={fmt(totalLikes)}
          hint={`${engagementRate}% engagement`}
        />
        <StatCard
          label="Subscribers"
          value={fmt(subscribers?.value ?? 0)}
          hint={`+${fmt(newSubCount)} this month`}
          href="/subscribers"
        />
        <StatCard
          label="Messages"
          value={fmt(messages?.value ?? 0)}
          hint={unreadCount > 0 ? `${fmt(unreadCount)} unread` : "All read"}
          hintVariant={unreadCount > 0 ? "urgent" : "default"}
          href="/messages"
        />
      </dl>

      <section className="mt-10">
        <SectionHeader title="Top posts" />
        {topPosts.length === 0 ? (
          <Empty>No post stats yet.</Empty>
        ) : (
          <ul className="mt-3 divide-y rounded-xl border bg-card">
            {topPosts.map((post, i) => (
              <li key={post.slug} className="flex items-center gap-3 px-4 py-3">
                <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium">
                      {slugToTitle(post.slug)}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {fmt(post.views)} views · {fmt(post.likes)} likes
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/60"
                      style={{
                        width: `${Math.max((post.views / maxViews) * 100, 2)}%`,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <SectionHeader title="Recent messages" href="/messages" />
          {recentMessages.length === 0 ? (
            <Empty>No messages yet.</Empty>
          ) : (
            <ul className="mt-3 divide-y rounded-xl border bg-card">
              {recentMessages.map((msg) => (
                <li key={msg.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {msg.name}
                      {!msg.read && <Badge>New</Badge>}
                    </span>
                    <time
                      dateTime={msg.createdAt.toISOString()}
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {formatDate(msg.createdAt.toISOString())}
                    </time>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {msg.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader title="Recent subscribers" href="/subscribers" />
          {recentSubscribers.length === 0 ? (
            <Empty>No subscribers yet.</Empty>
          ) : (
            <ul className="mt-3 divide-y rounded-xl border bg-card">
              {recentSubscribers.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="truncate text-sm">{sub.email}</span>
                  <time
                    dateTime={sub.createdAt.toISOString()}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {formatDate(sub.createdAt.toISOString())}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

function StatCard({
  label,
  value,
  hint,
  hintVariant = "default",
  href,
}: {
  label: string
  value: string
  hint?: string
  hintVariant?: "default" | "urgent"
  href?: string
}) {
  const inner = (
    <div className="h-full rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold tabular-nums">{value}</dd>
      {hint ? (
        <dd
          className={cn(
            "mt-1 text-xs",
            hintVariant === "urgent"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {hint}
        </dd>
      ) : null}
    </div>
  )
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  )
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          View all →
        </Link>
      ) : null}
    </div>
  )
}

function Empty({ children }: Readonly<{ children: React.ReactNode }>) {
  return <p className="mt-4 text-sm text-muted-foreground">{children}</p>
}

function fmt(n: number | string): string {
  return Number(n).toLocaleString("en-US")
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

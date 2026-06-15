import { desc } from "drizzle-orm"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { db } from "@workspace/db"
import { contactMessages } from "@workspace/db/schema"

import { formatDate } from "@/lib/format"

import { deleteMessage, setMessageRead } from "../actions"

export const dynamic = "force-dynamic"

export const metadata = { title: "Messages" }

export default async function MessagesPage() {
  const messages = await db()
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
        {unreadCount > 0 ? (
          <span className="text-sm text-muted-foreground">
            {unreadCount} unread
          </span>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-xl border bg-card p-4 data-unread:border-foreground/20"
              data-unread={message.read ? undefined : ""}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{message.name}</span>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {message.email}
                  </a>
                  {message.read ? null : <Badge>New</Badge>}
                </div>
                <time
                  dateTime={message.createdAt.toISOString()}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatDate(message.createdAt.toISOString())}
                </time>
              </div>

              <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">
                {message.message}
              </p>

              <div className="mt-4 flex items-center gap-2 border-t pt-3">
                <a
                  href={`mailto:${message.email}?subject=Re: Your message`}
                  className="inline-flex h-7 items-center rounded-md bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-80"
                >
                  Reply
                </a>
                <form
                  action={setMessageRead.bind(null, message.id, !message.read)}
                >
                  <Button type="submit" variant="outline" size="xs">
                    Mark as {message.read ? "unread" : "read"}
                  </Button>
                </form>
                <form action={deleteMessage.bind(null, message.id)}>
                  <Button type="submit" variant="ghost" size="xs">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

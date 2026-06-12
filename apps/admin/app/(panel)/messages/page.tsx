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

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
      {messages.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No messages yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-xl border bg-card p-4 data-unread:border-foreground/30"
              data-unread={message.read ? undefined : ""}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{message.name}</span>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {message.email}
                  </a>
                  {!message.read ? <Badge>New</Badge> : null}
                </div>
                <time
                  dateTime={message.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(message.createdAt.toISOString())}
                </time>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap">{message.message}</p>
              <div className="mt-4 flex items-center gap-2">
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

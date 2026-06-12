import Link from "next/link"

import { requireAdmin } from "@/lib/session"

import { SignOutButton } from "./sign-out-button"

const adminNav = [
  { href: "/", label: "Dashboard" },
  { href: "/messages", label: "Messages" },
  { href: "/subscribers", label: "Subscribers" },
]

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex items-center justify-between gap-4">
        <nav aria-label="Admin">
          <ul className="flex items-center gap-4">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar comes from the OAuth provider's CDN
              <img
                src={session.user.image}
                alt=""
                className="size-6 rounded-full"
              />
            ) : null}
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.email}
            </span>
          </span>
          <SignOutButton />
        </div>
      </div>
      <main className="mt-8">{children}</main>
    </div>
  )
}

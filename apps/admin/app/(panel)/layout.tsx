import { requireAdmin } from "@/lib/session"
import { ThemeToggle } from "@/components/theme-toggle"

import { NavItem } from "./nav-item"
import { SignOutButton } from "./sign-out-button"

const adminNav = [
  { href: "/", label: "Overview" },
  { href: "/messages", label: "Messages" },
  { href: "/subscribers", label: "Subscribers" },
]

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireAdmin()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-1">
            <span className="mr-4 font-medium tracking-tight">Admin</span>
            <nav aria-label="Admin">
              <ul className="flex items-center gap-1">
                {adminNav.map((item) => (
                  <li key={item.href}>
                    <NavItem href={item.href} label={item.label} />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2 border-l pl-3 sm:flex">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="size-6 rounded-full"
                />
              ) : null}
              <span className="text-sm text-muted-foreground">
                {session.user.name ?? session.user.email}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
        {children}
      </main>
    </div>
  )
}

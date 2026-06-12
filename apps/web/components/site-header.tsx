import Link from "next/link"

import { CommandMenu } from "@/components/command-menu"
import { NavLink } from "@/components/nav-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { site } from "@/lib/site"

export function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur"
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="font-medium tracking-tight transition-opacity hover:opacity-70"
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-1">
          <nav aria-label="Main">
            <ul className="flex items-center gap-1">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <CommandMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className="nav-link"
    >
      {label}
    </Link>
  )
}

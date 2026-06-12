"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useHotkey } from "@tanstack/react-hotkeys"
import {
  FileText,
  Home,
  Mail,
  Monitor,
  Moon,
  Rss,
  Search,
  Sun,
  User,
  Wrench,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@workspace/ui/components/button"
import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command"
import { Kbd } from "@workspace/ui/components/kbd"

import { getPostsIndex, type PostIndexEntry } from "@/lib/posts-index"
import { site } from "@/lib/site"

const pageIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/about": User,
  "/blog": FileText,
  "/uses": Wrench,
}

const pages = site.nav.map((item) => ({
  ...item,
  icon: pageIcons[item.href] ?? FileText,
}))

export function CommandMenu() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const [posts, setPosts] = React.useState<PostIndexEntry[]>([])

  useHotkey("Mod+K", () => setOpen((value) => !value))

  // Load the search index the first time the palette opens.
  React.useEffect(() => {
    if (!open || posts.length > 0) return
    let cancelled = false
    getPostsIndex()
      .then((index) => {
        if (!cancelled) setPosts(index.posts)
      })
      .catch(() => {
        // Search still works for pages/actions without the index.
      })
    return () => {
      cancelled = true
    }
  }, [open, posts.length])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Search (Ctrl+K)"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search the site"
        description="Search posts and pages, or run an action"
      >
        <Command>
          <CommandInput placeholder="Search posts, pages, actions…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Posts">
              {posts.map((post) => (
                <CommandItem
                  key={post.slug}
                  value={post.title}
                  keywords={[...post.tags, post.description, post.content]}
                  onSelect={() =>
                    runCommand(() => router.push(`/blog/${post.slug}`))
                  }
                >
                  <FileText aria-hidden />
                  <span className="truncate">{post.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.href}
                  onSelect={() => runCommand(() => router.push(page.href))}
                >
                  <page.icon aria-hidden />
                  {page.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Theme">
              <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                <Sun aria-hidden />
                Light
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                <Moon aria-hidden />
                Dark
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                <Monitor aria-hidden />
                System
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() =>
                  runCommand(() => {
                    window.location.href = `mailto:${site.email}`
                  })
                }
              >
                <Mail aria-hidden />
                Email me
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => window.open("/feed.xml", "_blank"))
                }
              >
                <Rss aria-hidden />
                RSS feed
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

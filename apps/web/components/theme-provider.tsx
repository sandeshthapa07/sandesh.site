"use client"

import * as React from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  // Single-key hotkeys ignore input-like elements by default.
  useHotkey("D", () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  })

  return null
}

export { ThemeProvider }

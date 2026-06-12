import type { Metadata } from "next"

import "@workspace/ui/globals.css"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  description: "Portfolio admin panel",
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}

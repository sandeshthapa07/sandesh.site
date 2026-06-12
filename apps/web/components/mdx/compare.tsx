import { cn } from "@workspace/ui/lib/utils"

/** Side-by-side do/don't comparison for blog posts. */
export function Compare({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">{children}</div>
  )
}

export function CompareItem({
  variant,
  label,
  children,
}: {
  variant: "do" | "dont"
  label?: string
  children: React.ReactNode
}) {
  const isDo = variant === "do"
  return (
    <figure className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="flex min-h-32 flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        {children}
      </div>
      <figcaption className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs font-medium">
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            isDo ? "bg-green-500" : "bg-red-500",
          )}
        />
        <span className="sr-only">{isDo ? "Do:" : "Don't:"}</span>
        {label ?? (isDo ? "Do" : "Don't")}
      </figcaption>
    </figure>
  )
}

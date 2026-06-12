export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <header>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-1.5 text-muted-foreground">{description}</p>
      ) : null}
    </header>
  )
}

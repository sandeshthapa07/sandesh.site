import { cn } from "@workspace/ui/lib/utils"

type PageContainerProps<T extends React.ElementType> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

export function PageContainer<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: PageContainerProps<T>) {
  const Component = as ?? "div"
  return (
    <Component
      className={cn("mx-auto max-w-2xl px-5 py-12 sm:py-16", className)}
      {...props}
    />
  )
}

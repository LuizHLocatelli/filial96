import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md glass-card",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-primary/20 before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

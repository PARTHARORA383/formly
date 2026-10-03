import type { IconComponent } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"

type EmptyStateProps = {
  icon: IconComponent
  title: string
  description?: string
  className?: string
}

// A single icon on a muted tile, a title and an optional line of help. Used
// wherever a panel has nothing to show yet.
export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-4 py-10 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

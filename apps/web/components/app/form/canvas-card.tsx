import { cn } from "@workspace/ui/lib/utils"
import { FieldRenderer } from "@/components/app/form/field"
import type { FormField } from "@/types/field"

const noop = () => { }

export function CanvasCard({
  field,
  selected = false,
  dimmed = false,
  className,
}: {
  field: FormField
  selected?: boolean
  dimmed?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border py-2.5 pr-9 pl-3 transition-[opacity,background-color,border-color] duration-200",

        selected
          ? "border-border/60 bg-muted dark:bg-muted"
          : "border-border/60 bg-muted/60 dark:bg-muted",
        dimmed && "opacity-65 hover:opacity-85",
        className
      )}
    >
      <div inert>
        <FieldRenderer
          field={field}
          value={undefined}
          onChange={noop}
          className="gap-1.5"
        />
      </div>
    </div>
  )
}

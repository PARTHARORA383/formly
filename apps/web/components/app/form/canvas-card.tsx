import { cn } from "@workspace/ui/lib/utils"
import { FieldRenderer } from "@/components/app/form/field"
import type { FormField } from "@/types/field"

const noop = () => {}

// The question card with no behaviour attached, so the list item and the copy
// that follows the pointer while dragging look identical.
export function CanvasCard({
  field,
  selected = false,
  dimmed = false,
  className,
}: {
  field: FormField
  selected?: boolean
  /** Another question is selected, so this one steps back. */
  dimmed?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border py-2.5 pr-9 pl-3 transition-[opacity,background-color,border-color] duration-200",
        // Every card sits on a muted fill with a hairline border; the selected
        // one is a step stronger on both while the rest fade back.
        selected ? "border-border/60 bg-muted" : "border-border/30 bg-muted/40 hover:bg-muted/60",
        dimmed && "opacity-40 hover:opacity-70",
        className
      )}
    >
      {/* inert keeps the preview input out of the tab order and stops it from
          capturing clicks, so the whole card acts as one selection target. */}
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

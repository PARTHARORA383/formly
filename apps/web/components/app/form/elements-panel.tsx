"use client"

import { useDraggable } from "@dnd-kit/core"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { useCollapsiblePanel } from "@workspace/ui/components/collapsible-panels"
import useFields from "@/lib/zustand/form"
import { ELEMENT_GROUPS, FIELD_TYPES, type FieldType } from "@/utils/constants"

// Clicking an element adds a question of that type to the canvas. While the
// panel is collapsed to its icon rail, clicking opens the panel instead, so a
// stray click on a narrow rail can't change the form.
//
// Follows the shadcn sidebar's icon mode: the layout never changes, the panel
// edge just clips it. Labels are nowrap and the buttons overflow-hidden, so the
// icons stay put and the text is cut off as the panel narrows; headings fade.
function ElementButton({ type }: { type: FieldType }) {
  const addField = useFields((state) => state.addField)
  const { isCollapsed, expand } = useCollapsiblePanel()
  const { label, icon } = FIELD_TYPES[type]
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `element-${type}`,
    data: { kind: "element", type },
  })

  return (
    <Button
      ref={setNodeRef}
      type="button"
      variant="outline"
      title={label}
      aria-label={label}
      // The original stays put but faded while its copy follows the pointer.
      className={cn(
        "w-full cursor-grab touch-none justify-start gap-2 overflow-hidden px-2 whitespace-nowrap transition-opacity",
        isDragging && "opacity-40"
      )}
      onClick={() => (isCollapsed ? expand() : addField(type))}
      {...listeners}
      {...attributes}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4 shrink-0" />
      {label}
    </Button>
  )
}

export function ElementsPanel() {
  return (
    <div className="flex flex-col gap-5 p-2">
      <h3 className="px-2 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
        Elements
      </h3>

      {ELEMENT_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          <p className="px-2 text-xs whitespace-nowrap text-muted-foreground transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
            {group.label}
          </p>

          {group.types.map((type) => (
            <ElementButton key={type} type={type} />
          ))}
        </div>
      ))}
    </div>
  )
}

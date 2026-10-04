"use client"

import { useDraggable } from "@dnd-kit/core"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { useCollapsiblePanel } from "@workspace/ui/components/collapsible-panels"
import useFields from "@/lib/zustand/form"
import { AddQuestionButton } from "@/components/app/form/add-question-button"
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
  const { label, icon: Icon } = FIELD_TYPES[type]
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
        "h-8 w-full cursor-grab touch-none justify-start gap-2 overflow-hidden rounded-lg px-2 whitespace-nowrap transition-[opacity,background-color,color,padding] group-data-[collapsible=icon]:px-1.5",
        // No border or fill at rest. On hover: a muted background and sky text.
        "border-transparent bg-transparent hover:bg-muted hover:text-sky-500 dark:border-transparent dark:bg-transparent dark:hover:bg-muted",
        // Icons stay slate at rest. On hover they turn sky: the main shape in
        // full sky-500 (the icons read --icon) and the light tone at half strength.
        "hover:[--icon:var(--color-sky-500)] hover:[&_svg_[opacity]]:opacity-50",
        isDragging && "opacity-40"
      )}
      onClick={() => (isCollapsed ? expand() : addField(type))}
      {...listeners}
      {...attributes}
    >
      <Icon className="size-[18px] shrink-0" />
      {label}
    </Button>
  )
}

export function ElementsPanel() {
  return (
    <div className="flex min-h-full flex-col gap-5 p-2">
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

      {/* Pinned to the bottom of the panel, and stays there while the
          elements scroll. */}
      <div className="sticky bottom-0 mt-auto bg-background pt-2 pb-0">
        <AddQuestionButton />
      </div>
    </div>
  )
}

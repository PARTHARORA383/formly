"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  type SortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Cancel01Icon, Note01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"
import {
  CANVAS_AREA_ATTRIBUTE,
  CANVAS_DROPPABLE_ID,
  CANVAS_ITEM_ATTRIBUTE,
  useFormDnd,
} from "@/components/app/form/form-dnd"
import { CanvasCard } from "@/components/app/form/canvas-card"
import { IconTooltip } from "@/components/common/icon-tooltip"
import { EmptyState } from "@/components/common/empty-state"
import { FormDetails } from "@/components/app/form/form-details"
import { SaveDraftButton } from "@/components/app/form/save-draft-button"
import { AddQuestionButton } from "@/components/app/form/add-question-button"
import useFields, { fieldKey } from "@/lib/zustand/form"
import type { FormField } from "@/types/field"

function CanvasItem({
  field,
  selected,
  dimmed,
  onSelect,
}: {
  field: FormField
  selected: boolean
  dimmed: boolean
  onSelect: () => void
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const removeField = useFields((state) => state.removeField)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: fieldKey(field),
    data: { kind: "field" },
  })

  // A new question is appended below the button, possibly out of view.
  React.useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selected])

  return (
    <div
      ref={(node) => {
        ref.current = node
        setNodeRef(node)
      }}
      {...{ [CANVAS_ITEM_ATTRIBUTE]: "" }}
      {...attributes}
      {...listeners}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        // Keys pressed on the remove button are its own, not a selection.
        if (event.target !== event.currentTarget) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      // The transform and transition are what slide the other questions out of
      // the way while one is being carried.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group/item relative animate-in cursor-pointer touch-none rounded-lg border border-transparent duration-300 fade-in outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // The slot the carried question will land in: a muted, fixed box.
        isDragging && "border-border border-dashed bg-muted/60"
      )}
    >
      {/* Kept in the layout, just hidden, so the slot keeps the card's size. */}
      <CanvasCard
        field={field}
        selected={selected}
        dimmed={dimmed}
        className={cn(isDragging && "invisible")}
      />

      {/* Stops the press and the click here, so removing a question neither
          starts a drag nor selects the card on the way out. */}
      <IconTooltip
        icon={Cancel01Icon}
        tooltip="Remove question"
        side="top"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          removeField(fieldKey(field))
        }}
        className={cn(
          "absolute top-1.5 right-1.5 size-6 opacity-0 group-focus-within/item:opacity-100 group-hover/item:opacity-100 hover:bg-muted",
          selected && "opacity-100",
          isDragging && "hidden"
        )}
        iconClassName="size-3.5"
      />
    </div>
  )
}

// A line that fades in where the dragged element would land. The negative
// margin cancels most of the flex gap around it so the list doesn't shift.
function DropIndicator({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "-my-[6.5px] h-px rounded-full bg-primary transition-[opacity,margin] duration-150",
        active ? "opacity-100" : "opacity-0"
      )}
    />
  )
}

export function FormCanvas({ publicId }: { publicId: string }) {
  const fields = useFields((state) => state.fields)
  const selectedKey = useFields((state) => state.selectedKey)
  const selectField = useFields((state) => state.selectField)
  const { dropIndex, activeKind } = useFormDnd()
  const { setNodeRef } = useDroppable({ id: CANVAS_DROPPABLE_ID })

  // Existing questions only shuffle when one of them is being carried. A new
  // element dragged in shows the drop line instead.
  const strategy: SortingStrategy = (args) =>
    activeKind === "element" ? null : verticalListSortingStrategy(args)

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
        <FormDetails />
        <div className="flex items-center gap-2">
          <SaveDraftButton publicId={publicId} />
          <AddQuestionButton />
        </div>
      </div>

      <div
        ref={setNodeRef}
        {...{ [CANVAS_AREA_ATTRIBUTE]: "" }}
        className={cn(
          "scrollbar-sleek min-h-0 flex-1 overflow-auto p-4 transition-colors duration-200",
          dropIndex !== null && "bg-primary/5"
        )}
      >
        {fields.length === 0 ? (
          <EmptyState
            icon={Note01Icon}
            title="No questions yet"
            description="Add your first question to get started."
          />
        ) : (
          <SortableContext items={fields.map(fieldKey)} strategy={strategy}>
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            {fields.map((field, index) => {
              const key = fieldKey(field)

              return (
                <React.Fragment key={key}>
                  <DropIndicator active={dropIndex === index} />
                  <CanvasItem
                    field={field}
                    selected={key === selectedKey}
                    dimmed={selectedKey !== null && key !== selectedKey}
                    onSelect={() => selectField(key)}
                  />
                </React.Fragment>
              )
            })}
            <DropIndicator active={dropIndex === fields.length} />
          </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}

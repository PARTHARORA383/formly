"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Note01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"
import {
  CANVAS_DROPPABLE_ID,
  CANVAS_ITEM_ATTRIBUTE,
  useDropIndex,
} from "@/components/app/form/form-dnd"
import { EmptyState } from "@/components/common/empty-state"
import { FieldRenderer } from "@/components/app/form/field"
import { AddQuestionButton } from "@/components/app/form/add-question-button"
import useFields, { fieldKey } from "@/lib/zustand/form"
import type { FormField } from "@/types/field"

const noop = () => {}

function CanvasItem({
  field,
  selected,
  onSelect,
}: {
  field: FormField
  selected: boolean
  onSelect: () => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  // A new question is appended below the button, possibly out of view.
  React.useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [selected])

  return (
    <div
      ref={ref}
      {...{ [CANVAS_ITEM_ATTRIBUTE]: "" }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "animate-in cursor-pointer rounded-lg border p-4 duration-300 fade-in slide-in-from-top-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
    >
      {/* inert keeps the preview input out of the tab order and stops it from
          capturing clicks, so the whole card acts as one selection target. */}
      <div inert>
        <FieldRenderer field={field} value={undefined} onChange={noop} />
      </div>
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
        "-my-1.5 h-0.5 rounded-full bg-primary transition-[opacity,margin] duration-150",
        active ? "opacity-100" : "opacity-0"
      )}
    />
  )
}

export function FormCanvas() {
  const fields = useFields((state) => state.fields)
  const selectedKey = useFields((state) => state.selectedKey)
  const selectField = useFields((state) => state.selectField)
  const dropIndex = useDropIndex()
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROPPABLE_ID })

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b py-2 pr-12 pl-4">
        <span className="text-sm text-muted-foreground">
          {fields.length} {fields.length === 1 ? "question" : "questions"}
        </span>
        <AddQuestionButton />
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-0 flex-1 overflow-auto p-4 transition-colors duration-200",
          isOver && "bg-primary/5"
        )}
      >
        {fields.length === 0 ? (
          <EmptyState
            icon={Note01Icon}
            title="No questions yet"
            description="Add your first question to get started."
          />
        ) : (
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            {fields.map((field, index) => {
              const key = fieldKey(field)

              return (
                <React.Fragment key={key}>
                  <DropIndicator active={dropIndex === index} />
                  <CanvasItem
                    field={field}
                    selected={key === selectedKey}
                    onSelect={() => selectField(key)}
                  />
                </React.Fragment>
              )
            })}
            <DropIndicator active={dropIndex === fields.length} />
          </div>
        )}
      </div>
    </div>
  )
}

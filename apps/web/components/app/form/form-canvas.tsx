"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
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
        "cursor-pointer rounded-lg border p-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
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

export function FormCanvas() {
  const fields = useFields((state) => state.fields)
  const selectedKey = useFields((state) => state.selectedKey)
  const selectField = useFields((state) => state.selectField)

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b py-2 pr-12 pl-4">
        <span className="text-sm text-muted-foreground">
          {fields.length} {fields.length === 1 ? "question" : "questions"}
        </span>
        <AddQuestionButton />
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {fields.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No questions yet. Add your first one.
          </p>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            {fields.map((field) => {
              const key = fieldKey(field)

              return (
                <CanvasItem
                  key={key}
                  field={field}
                  selected={key === selectedKey}
                  onSelect={() => selectField(key)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

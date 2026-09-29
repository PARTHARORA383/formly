"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import useFields from "@/lib/zustand/form"
import { FIELD_TYPES, type FieldType } from "@/utils/constants"

export const CANVAS_DROPPABLE_ID = "canvas"
// Canvas items carry this attribute so the drop position can be read off the DOM.
export const CANVAS_ITEM_ATTRIBUTE = "data-canvas-item"

// Where the dragged element would land, as an index into the fields array.
// null while nothing is being dragged over the canvas.
const DropIndexContext = React.createContext<number | null>(null)

export function useDropIndex() {
  return React.useContext(DropIndexContext)
}

// Insert before the first question whose midpoint is below the pointer.
function indexAtY(y: number) {
  const items = document.querySelectorAll(`[${CANVAS_ITEM_ATTRIBUTE}]`)

  for (let index = 0; index < items.length; index++) {
    const rect = items[index]!.getBoundingClientRect()
    if (y < rect.top + rect.height / 2) return index
  }

  return items.length
}

function centerY(event: DragMoveEvent) {
  const rect = event.active.rect.current.translated
  return rect ? rect.top + rect.height / 2 : null
}

/**
 * Drag an element from the panel and drop it on the canvas to add a question
 * of that type at the drop position. Clicking an element still adds it, since
 * a drag only starts after the pointer has moved a few pixels.
 */
export function FormDndProvider({ children }: { children: React.ReactNode }) {
  const addField = useFields((state) => state.addField)
  const [active, setActive] = React.useState<{ type: FieldType; width: number } | null>(null)
  const [dropIndex, setDropIndex] = React.useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type as FieldType | undefined
    if (!type) return

    setActive({ type, width: event.active.rect.current.initial?.width ?? 0 })
  }

  function handleDragMove(event: DragMoveEvent) {
    const y = centerY(event)

    // Bails out when the value is unchanged, so this is cheap on every move.
    setDropIndex(event.over?.id === CANVAS_DROPPABLE_ID && y !== null ? indexAtY(y) : null)
  }

  function finish() {
    setActive(null)
    setDropIndex(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={(event) => {
        if (active && dropIndex !== null && event.over?.id === CANVAS_DROPPABLE_ID) {
          addField(active.type, dropIndex)
        }
        finish()
      }}
      onDragCancel={finish}
    >
      <DropIndexContext.Provider value={dropIndex}>{children}</DropIndexContext.Provider>

      {/* The whole element follows the pointer, faded so the canvas stays
          readable underneath. On release it fades out in place while the new
          question animates in, instead of snapping back to the panel. */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "ease-out",
          keyframes: ({ transform }) => {
            const position = `translate3d(${transform.initial.x}px, ${transform.initial.y}px, 0)`
            return [
              { transform: `${position} scale(1)`, opacity: 0.7 },
              { transform: `${position} scale(0.96)`, opacity: 0 },
            ]
          },
        }}
      >
        {active ? <ElementPreview type={active.type} width={active.width} /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function ElementPreview({ type, width }: { type: FieldType; width: number }) {
  const { label, icon } = FIELD_TYPES[type]

  return (
    <Button
      type="button"
      variant="outline"
      style={{ width: width || undefined }}
      className="cursor-grabbing justify-start gap-2 bg-background px-2 whitespace-nowrap opacity-70 shadow-lg"
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4 shrink-0" />
      {label}
    </Button>
  )
}

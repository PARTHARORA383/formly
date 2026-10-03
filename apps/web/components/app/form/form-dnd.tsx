"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragMoveEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core"

import { Button } from "@workspace/ui/components/button"
import { CanvasCard } from "@/components/app/form/canvas-card"
import useFields, { fieldKey } from "@/lib/zustand/form"
import { FIELD_TYPES, type FieldType } from "@/utils/constants"

export const CANVAS_DROPPABLE_ID = "canvas"
// Canvas items carry this attribute so the drop position can be read off the DOM.
export const CANVAS_ITEM_ATTRIBUTE = "data-canvas-item"
// The scrolling canvas area, which a dragged question is kept inside.
export const CANVAS_AREA_ATTRIBUTE = "data-canvas-area"

// Two kinds of drag share one context: a new question dragged in from the
// Elements panel, and an existing question dragged to reorder.
type ActiveDrag =
  | { kind: "element"; type: FieldType; width: number }
  | { kind: "field"; key: string; width: number }

type DndState = {
  // Where a dragged element would land, as an index into the fields array.
  // null while nothing is being dragged over the canvas.
  dropIndex: number | null
  activeKind: ActiveDrag["kind"] | null
}

const DndStateContext = React.createContext<DndState>({ dropIndex: null, activeKind: null })

export function useFormDnd() {
  return React.useContext(DndStateContext)
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

// Reordering is decided by which question the card is nearest to, so it can be
// carried around freely. The canvas itself is excluded: it is only a target for
// new elements. Elements are decided by where the pointer is.
const collisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.kind === "field") {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.id !== CANVAS_DROPPABLE_ID
      ),
    })
  }

  return pointerWithin(args)
}

// A dragged question moves freely but can't leave the canvas area.
const restrictToCanvas: Modifier = ({ transform, draggingNodeRect, active }) => {
  if (active?.data.current?.kind !== "field" || !draggingNodeRect) return transform

  const area = document.querySelector(`[${CANVAS_AREA_ATTRIBUTE}]`)
  if (!area) return transform

  const bounds = area.getBoundingClientRect()
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max))

  return {
    ...transform,
    x: clamp(
      transform.x,
      bounds.left - draggingNodeRect.left,
      bounds.right - draggingNodeRect.right
    ),
    y: clamp(
      transform.y,
      bounds.top - draggingNodeRect.top,
      bounds.bottom - draggingNodeRect.bottom
    ),
  }
}

export function FormDndProvider({ children }: { children: React.ReactNode }) {
  const addField = useFields((state) => state.addField)
  const moveField = useFields((state) => state.moveField)
  const [active, setActive] = React.useState<ActiveDrag | null>(null)
  const [dropIndex, setDropIndex] = React.useState<number | null>(null)

  // A drag only starts after the pointer has moved a few pixels, so clicking a
  // question or an element still selects or adds it.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current
    const width = event.active.rect.current.initial?.width ?? 0

    if (data?.kind === "element") {
      setActive({ kind: "element", type: data.type as FieldType, width })
    } else if (data?.kind === "field") {
      setActive({ kind: "field", key: String(event.active.id), width })
    }
  }

  function handleDragMove(event: DragMoveEvent) {
    if (active?.kind !== "element") return
    const y = centerY(event)

    // Bails out when the value is unchanged, so this is cheap on every move.
    setDropIndex(event.over && y !== null ? indexAtY(y) : null)
  }

  function finish() {
    setActive(null)
    setDropIndex(null)
  }

  const state = React.useMemo(
    () => ({ dropIndex, activeKind: active?.kind ?? null }),
    [dropIndex, active?.kind]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={[restrictToCanvas]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={(event) => {
        if (active?.kind === "element" && dropIndex !== null) {
          addField(active.type, dropIndex)
        }

        // Dropped outside the list, or on itself, leaves the order untouched.
        if (active?.kind === "field" && event.over && event.over.id !== event.active.id) {
          moveField(String(event.active.id), String(event.over.id))
        }

        finish()
      }}
      onDragCancel={finish}
    >
      <DndStateContext.Provider value={state}>{children}</DndStateContext.Provider>

      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
          keyframes: ({ active, transform }) => {
            const position = `translate3d(${transform.initial.x}px, ${transform.initial.y}px, 0)`

            // A reordered question settles into its slot, straightening out as it lands.
            if (active.data.current?.kind === "field") {
              const final = `translate3d(${transform.final.x}px, ${transform.final.y}px, 0)`
              return [
                { transform: `${position} rotate(-3deg) scale(1.03)` },
                { transform: `${final} rotate(0deg) scale(1)` },
              ]
            }

            // A new element fades out where it was released, while the question
            // it becomes animates in on the canvas.
            return [
              { transform: `${position} scale(1)`, opacity: 0.7 },
              { transform: `${position} scale(0.96)`, opacity: 0 },
            ]
          },
        }}
      >
        {active?.kind === "element" && (
          <ElementPreview type={active.type} width={active.width} />
        )}
        {active?.kind === "field" && <FieldPreview fieldId={active.key} width={active.width} />}
      </DragOverlay>
    </DndContext>
  )
}

// The whole element follows the pointer, faded so the canvas stays readable.
function ElementPreview({ type, width }: { type: FieldType; width: number }) {
  const { label, icon: Icon } = FIELD_TYPES[type]

  return (
    <Button
      type="button"
      variant="outline"
      style={{ width: width || undefined }}
      className="cursor-grabbing justify-start gap-2 bg-background px-2 whitespace-nowrap opacity-70 shadow-lg"
    >
      <Icon className="size-[18px] shrink-0" />
      {label}
    </Button>
  )
}

// The lifted question: tilted, raised and ringed like it has been picked up.
function FieldPreview({ fieldId, width }: { fieldId: string; width: number }) {
  const field = useFields((state) =>
    state.fields.find((item) => fieldKey(item) === fieldId)
  )
  if (!field) return null

  return (
    <div
      style={{ width: width || undefined }}
      className="-rotate-3 scale-[1.03] cursor-grabbing rounded-lg shadow-[0_18px_40px_-12px] shadow-sky-500/40"
    >
      <CanvasCard field={field} className="border-sky-500 bg-muted dark:bg-muted" />
    </div>
  )
}

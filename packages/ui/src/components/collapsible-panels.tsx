"use client"

import * as React from "react"
import { usePanelRef } from "react-resizable-panels"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeftDoubleIcon, ArrowRightDoubleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable"

const COLLAPSED_PX = 44
const COLLAPSED_WIDTH = `${COLLAPSED_PX}px`
const ANIMATION_MS = 400
// A spring settle rather than a plain ease — quick off the mark, then eases
// into the target. Deliberately without overshoot: overshooting flex-grow
// would shove the neighbouring panels past their final width and read as a
// glitch rather than a bounce.
const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)"

type CollapsiblePanelProps = {
  children: React.ReactNode
  /** Percentage of the group, same units as ResizablePanel. */
  defaultSize?: number
  minSize?: number
  maxSize?: number
  /** Adds the collapse toggle. Omit for panels that should always stay open. */
  collapsible?: boolean
  /** Which edge the toggle sits on, and which way the chevrons point. */
  side?: "left" | "right"
  className?: string
}

function CollapsiblePanel({
  children,
  defaultSize,
  minSize,
  maxSize,
  collapsible = false,
  side = "left",
  className,
}: CollapsiblePanelProps) {
  const panelRef = usePanelRef()
  const elementRef = React.useRef<HTMLDivElement>(null)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const animationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // The button drives state directly so the icon and body flip immediately,
  // without waiting on a callback. The panel handle's isCollapsed() and the
  // onResize callback both read stale right after a programmatic change, so
  // neither is trustworthy as the primary signal.
  function toggle() {
    const panel = panelRef.current
    const element = elementRef.current
    if (!panel) return

    // The transition has to go on this element specifically: it's the node the
    // library sets flex-grow on. className can't reach it — the library forwards
    // that to an inner child — and the style prop is documented as locked. So
    // it's applied imperatively, then removed so dragging stays 1:1 with the
    // cursor instead of lagging a transition behind it.
    if (element) {
      element.style.transition = `flex-grow ${ANIMATION_MS}ms ${SPRING}`
      if (animationTimer.current) clearTimeout(animationTimer.current)
      animationTimer.current = setTimeout(() => {
        if (elementRef.current) elementRef.current.style.transition = ""
      }, ANIMATION_MS)
    }

    if (panel.isCollapsed()) {
      panel.expand()
      setIsCollapsed(false)
    } else {
      panel.collapse()
      setIsCollapsed(true)
    }
  }

  React.useEffect(() => {
    return () => {
      if (animationTimer.current) clearTimeout(animationTimer.current)
    }
  }, [])

  // Corrects state from the rendered width, which is the only always-accurate
  // source. Covers dragging the handle far enough to collapse, and window
  // resizes, neither of which go through the button.
  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setIsCollapsed(entry.contentRect.width <= COLLAPSED_PX + 1)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Chevrons point the way the panel will move: a left panel collapses left.
  const collapseIcon = side === "left" ? ArrowLeftDoubleIcon : ArrowRightDoubleIcon
  const expandIcon = side === "left" ? ArrowRightDoubleIcon : ArrowLeftDoubleIcon

  if (!collapsible) {
    return (
      <ResizablePanel
        defaultSize={defaultSize}
        minSize={minSize}
        maxSize={maxSize}
        className={className}
      >
        {children}
      </ResizablePanel>
    )
  }

  return (
    <ResizablePanel
      panelRef={panelRef}
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      collapsible
      collapsedSize={COLLAPSED_WIDTH}
      elementRef={elementRef}
      className={cn("flex flex-col overflow-hidden", className)}
    >
      <div
        className={cn(
          "flex shrink-0 items-center p-2",
          isCollapsed ? "justify-center" : side === "left" ? "justify-end" : "justify-start"
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon
            icon={isCollapsed ? expandIcon : collapseIcon}
            strokeWidth={2}
            className="size-4"
          />
        </button>
      </div>

      {/* Faded rather than `hidden`, since display:none can't be transitioned.
          Kept mounted so panel state (scroll, focus, drafts) survives a
          collapse; the panel's overflow-hidden clips it while narrow. */}
      <div
        aria-hidden={isCollapsed}
        className={cn(
          "min-h-0 flex-1 overflow-auto transition-opacity",
          isCollapsed
            ? "pointer-events-none opacity-0 duration-150"
            : "opacity-100 duration-300"
        )}
      >
        {children}
      </div>
    </ResizablePanel>
  )
}

type CollapsiblePanelsProps = {
  children: React.ReactNode
  className?: string
  orientation?: "horizontal" | "vertical"
}

/**
 * Wraps any number of CollapsiblePanel children and inserts the drag handles
 * between them, so callers only declare the panels and their sizes.
 */
function CollapsiblePanels({
  children,
  className,
  orientation = "horizontal",
}: CollapsiblePanelsProps) {
  const panels = React.Children.toArray(children).filter(Boolean)

  return (
    <ResizablePanelGroup orientation={orientation} className={className}>
      {panels.map((panel, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ResizableHandle withHandle />}
          {panel}
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  )
}

export { CollapsiblePanels, CollapsiblePanel }

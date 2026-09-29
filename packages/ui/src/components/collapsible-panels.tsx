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

// Same numbers as the shadcn sidebar: a 3rem icon rail and a 200ms linear
// width transition.
const COLLAPSED_PX = 48
const COLLAPSED_WIDTH = `${COLLAPSED_PX}px`
const ANIMATION_MS = 200
const EASING = "linear"

type CollapsiblePanelContextValue = {
  isCollapsed: boolean
  expand: () => void
}

const CollapsiblePanelContext = React.createContext<CollapsiblePanelContextValue>({
  isCollapsed: false,
  expand: () => {},
})

/** Lets content inside a panel react to it being collapsed, e.g. a rail icon that opens it. */
function useCollapsiblePanel() {
  return React.useContext(CollapsiblePanelContext)
}

type CollapsiblePanelProps = {
  children: React.ReactNode
  /** Percentage of the group, same units as ResizablePanel. */
  defaultSize?: number
  minSize?: number
  maxSize?: number
  /** Adds the collapse toggle. Omit for panels that should always stay open. */
  collapsible?: boolean
  /** Which way the chevrons point: a left panel collapses left. The toggle is always top-right. */
  side?: "left" | "right"
  /**
   * Collapse to an icon rail, like the shadcn sidebar's `collapsible="icon"`.
   * The content stays mounted and in place while the panel narrows and clips
   * it. Style it with `group-data-[collapsible=icon]:` (labels fading out,
   * buttons shrinking to icons). Without this the content just fades away.
   */
  iconMode?: boolean
  className?: string
}

function CollapsiblePanel({
  children,
  defaultSize,
  minSize,
  maxSize,
  collapsible = false,
  side = "left",
  iconMode = false,
  className,
}: CollapsiblePanelProps) {
  const panelRef = usePanelRef()
  const elementRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const animationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  // True while a button-driven collapse/expand is animating. The width observer
  // below must stay quiet then: mid-animation the width is still above the
  // collapsed size, so it would flip the state straight back.
  const isAnimating = React.useRef(false)

  // The button drives state directly so the icon and body flip immediately,
  // without waiting on a callback. The panel handle's isCollapsed() and the
  // onResize callback both read stale right after a programmatic change, so
  // neither is trustworthy as the primary signal.
  function toggle() {
    const panel = panelRef.current
    const element = elementRef.current
    if (!panel) return

    isAnimating.current = true

    // Panels without an icon rail keep their content at the open width while
    // the edge slides over it, rather than letting it reflow each frame.
    if (!iconMode && bodyRef.current && element && !panel.isCollapsed()) {
      bodyRef.current.style.width = `${element.getBoundingClientRect().width}px`
    }

    // The transition has to go on this element specifically: it's the node the
    // library sets flex-grow on. className can't reach it — the library forwards
    // that to an inner child — and the style prop is documented as locked. So
    // it's applied imperatively, then removed so dragging stays 1:1 with the
    // cursor instead of lagging a transition behind it.
    if (element) {
      element.style.transition = `flex-grow ${ANIMATION_MS}ms ${EASING}`
    }
    if (animationTimer.current) clearTimeout(animationTimer.current)
    animationTimer.current = setTimeout(() => {
      isAnimating.current = false

      const current = elementRef.current
      if (!current) return
      current.style.transition = ""

      // The animation is over, so the measured width is trustworthy again.
      // Skipped at 0 (hidden or detached), which would read as "collapsed".
      const width = current.getBoundingClientRect().width
      if (width > 0) setIsCollapsed(width <= COLLAPSED_PX + 1)
      if (width > COLLAPSED_PX + 1 && bodyRef.current) bodyRef.current.style.width = ""
    }, ANIMATION_MS)

    if (panel.isCollapsed()) {
      panel.expand()
      setIsCollapsed(false)
    } else {
      panel.collapse()
      setIsCollapsed(true)
    }
  }

  // Only ever opens: a rail icon is not a second collapse button.
  function expand() {
    if (panelRef.current?.isCollapsed()) toggle()
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
      if (!entry || isAnimating.current) return
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
      className={cn("relative flex flex-col overflow-hidden", className)}
    >
      {/* Pinned to the top-right and taken out of the flow, so it never pushes
          the panel's content down. It sits outside the scrolling body, so it
          stays put while content scrolls. right-2 also lands it in the middle
          of the 48px collapsed rail. Content with right-aligned items on its
          first line needs right padding to clear it. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
        className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <HugeiconsIcon
          icon={isCollapsed ? expandIcon : collapseIcon}
          strokeWidth={2}
          className="size-4"
        />
      </button>

      {/* Kept mounted so panel state (scroll, focus, drafts) survives a
          collapse. data-collapsible mirrors the shadcn sidebar's attribute, so
          children can use group-data-[collapsible=icon]: variants. */}
      <div
        ref={bodyRef}
        data-collapsible={isCollapsed ? "icon" : ""}
        // Only a fully hidden body is aria-hidden/inert; an icon rail stays usable.
        aria-hidden={!iconMode && isCollapsed}
        inert={!iconMode && isCollapsed}
        className={cn(
          "group min-h-0 min-w-0 flex-1",
          iconMode
            ? "overflow-y-auto overflow-x-hidden"
            : "overflow-auto transition-opacity duration-200 ease-linear",
          isCollapsed && (iconMode ? "overflow-hidden" : "pointer-events-none opacity-0")
        )}
      >
        <CollapsiblePanelContext.Provider value={{ isCollapsed, expand }}>
          {children}
        </CollapsiblePanelContext.Provider>
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

export { CollapsiblePanels, CollapsiblePanel, useCollapsiblePanel }

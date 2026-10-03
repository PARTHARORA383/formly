"use client"

import type * as React from "react"
import type { IconComponent } from "@workspace/ui/icons"

import { cn } from "@workspace/ui/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

type IconTooltipProps = {
  icon: IconComponent
  /** Shown on hover or keyboard focus, and used as the icon's accessible name. */
  tooltip: string
  side?: "top" | "right" | "bottom" | "left"
  /** Greys the button out and ignores clicks. */
  disabled?: boolean
  /** Makes the icon an action button rather than just a hint. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>
  className?: string
  iconClassName?: string
}

// An icon that explains itself on hover, e.g. next to a setting's label.
export function IconTooltip({
  icon: Icon,
  tooltip,
  side = "top",
  disabled,
  onClick,
  onPointerDown,
  className,
  iconClassName,
}: IconTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={tooltip}
          disabled={disabled}
          onClick={onClick}
          onPointerDown={onPointerDown}
          className={cn(
            "inline-flex items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <Icon className={cn("size-[18px]", iconClassName)} />
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { cn } from "@workspace/ui/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

type IconTooltipProps = {
  icon: IconSvgElement
  /** Shown on hover or keyboard focus, and used as the icon's accessible name. */
  tooltip: string
  side?: "top" | "right" | "bottom" | "left"
  className?: string
  iconClassName?: string
}

// An icon that explains itself on hover, e.g. next to a setting's label.
export function IconTooltip({
  icon,
  tooltip,
  side = "top",
  className,
  iconClassName,
}: IconTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={tooltip}
          className={cn(
            "inline-flex items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} className={cn("size-4", iconClassName)} />
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

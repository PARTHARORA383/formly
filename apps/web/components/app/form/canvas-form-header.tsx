"use client"

import { cn } from "@workspace/ui/lib/utils"
import { FORM_FONTS, resolveFormFont } from "@/lib/form-fonts"
import useFields from "@/lib/zustand/form"

export function CanvasFormHeader() {
  const title = useFields((state) => state.title)
  const description = useFields((state) => state.description)
  const fontFamily = useFields((state) => state.settings.fontFamily)

  return (
    <header
      className="flex flex-col gap-1"
      style={{ fontFamily: FORM_FONTS[resolveFormFont(fontFamily)].family }}
    >
      <h1
        className={cn(
          "scroll-m-20 text-lg font-medium tracking-tight text-balance [overflow-wrap:anywhere]",
          !title.trim() && "text-muted-foreground/60"
        )}
      >
        {title.trim() || "Untitled form"}
      </h1>

      {description.trim() && (
        <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
          {description}
        </p>
      )}
    </header>
  )
}

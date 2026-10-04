"use client"

import { cn } from "@workspace/ui/lib/utils"
import { FORM_FONTS, resolveFormFont } from "@/lib/form-fonts"
import useFields from "@/lib/zustand/form"

export function CanvasFormHeader() {
  const title = useFields((state) => state.title)
  const description = useFields((state) => state.description)
  const fontFamily = useFields((state) => state.settings.fontFamily)
  const setSettingsTab = useFields((state) => state.setSettingsTab)

  return (
    // Clicking the heading opens the Form tab, where its title and description
    // are edited. It is a button for the keyboard too.
    <header
      role="button"
      tabIndex={0}
      aria-label="Edit form title and description"
      onClick={() => setSettingsTab("form")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setSettingsTab("form")
        }
      }}
      className="-mx-3 flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
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
        <p className="text-sm text-muted-foreground whitespace-pre-line [overflow-wrap:anywhere]">
          {description}
        </p>
      )}
    </header>
  )
}

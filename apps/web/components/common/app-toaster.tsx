"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"

// Glass toasts: a translucent fill with a heavy backdrop blur, a hairline
// border and generous rounding. `unstyled` drops sonner's own look so these
// classes are the whole design, and the theme follows the app's, which the
// default Toaster ignored (hence the white toast on a dark page).
export function AppToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position="bottom-center"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-(--width) items-center gap-3 rounded-xl border border-foreground/15 bg-muted/50 px-5 py-2 text-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.7)] backdrop-blur-2xl backdrop-saturate-150 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08)]",
          icon: "flex size-5 shrink-0 items-center justify-center [&>svg]:size-5",
          content: "flex flex-col gap-0.5",
          title: "text-[0.9375rem] leading-snug font-medium tracking-tight",
          description: "text-[0.8125rem] leading-snug text-muted-foreground",
          success: "[&_[data-icon]]:text-foreground",
          error: "[&_[data-icon]]:text-foreground",
          warning: "[&_[data-icon]]:text-foreground",
          info: "[&_[data-icon]]:text-foreground",
        },
      }}
    />
  )
}

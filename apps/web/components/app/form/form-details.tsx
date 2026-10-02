"use client"


import useFields from "@/lib/zustand/form"
import { Input } from "@workspace/ui/components/input"


export function FormDetails() {
  const title = useFields((state) => state.title)
  const setTitle = useFields((state) => state.setTitle)

  return (
    <div className="flex min-w-0 max-w-sm flex-1 flex-col">
      <Input
        aria-label="Form title"
        value={title}
        maxLength={255}
        placeholder="Untitled form"
        onChange={(event) => setTitle(event.target.value)}
        // dark:bg-transparent is what makes it transparent in dark mode: Input
        // sets its own dark:bg-input/30, and a plain bg-* class can't override a
        // dark: variant.
        className="w-full min-w-0 truncate rounded-md border-none bg-transparent px-2 py-0.5 text-sm font-medium shadow-none transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-0 dark:bg-transparent"
      />

    </div>
  )
}

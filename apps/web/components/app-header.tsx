"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar"
import { useMe } from "@/lib/query/auth"

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/forms": "Forms",
}

export function AppHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: user } = useMe()
  const { state } = useSidebar()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const title = titles[pathname] 

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      {/* Only shown while collapsed — the expanded trigger lives in the sidebar header */}
      {state === "collapsed" && (
        <>
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
        </>
      )}

      <h1 className="text-sm font-medium">{title}</h1>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && (
            <HugeiconsIcon
              icon={resolvedTheme === "dark" ? Sun01Icon : Moon02Icon}
              strokeWidth={2}
              className="size-4"
            />
          )}
        </Button>

        <Button variant="ghost" className="gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {(user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">Account</span>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
        </Button>
      </div>
    </header>
  )
}

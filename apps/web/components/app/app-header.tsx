"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Moon02Icon,
  Sun01Icon,
  ArrowDown01Icon,
  LayoutBottomIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { useMe } from "@/lib/query/auth"

const navItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Forms", href: "/forms" },
]

export function AppHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: user } = useMe()

  // resolvedTheme is undefined during SSR, so the icon would differ between
  // the server and client render. Wait for mount before showing it.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-6 border-b bg-background px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} className="size-4" />
        </div>
        <span className="font-medium">Formly</span>
      </Link>

      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          )
        })}
      </nav>

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
          <span className="text-sm">{user?.name ?? "Account"}</span>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
        </Button>
      </div>
    </header>
  )
}

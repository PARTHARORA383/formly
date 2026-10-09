"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { UserAvatar } from "@/components/app/user-avatar"
import { useLogout, useMe } from "@/lib/query/auth"
import { ChevronDownIcon, LayoutBottomIcon, LogoutIcon, MoonIcon, SunIcon } from "@workspace/ui/icons"

const navItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Forms", href: "/forms" },
]

export function AppHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: user } = useMe()
  const logout = useLogout()

  function handleLogout() {
    logout.mutate(undefined, {
      // A full load, not router.replace: the React Query cache still holds the
      // user, and GuestGuard on /login would read it and bounce back here.
      onSuccess: () => window.location.replace("/login"),
    })
  }



  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-6 border-b bg-background px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LayoutBottomIcon fill="currentColor" className="size-[18px]" />
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
           {(resolvedTheme === "dark" ? <SunIcon className="size-[18px]" /> : <MoonIcon className="size-[18px]" />)}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2" />}>
            <UserAvatar user={user} size={24} />
            <span className="text-sm">{user?.name ?? "Account"}</span>
            <ChevronDownIcon className="size-[18px]" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-auto min-w-40">
            <DropdownMenuItem
              variant="destructive"
              disabled={logout.isPending}
              onClick={handleLogout}
            >
              <LogoutIcon className="size-[18px]" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

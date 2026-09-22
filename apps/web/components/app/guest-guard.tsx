"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useMe } from "@/lib/query/auth"

// The mirror of AuthGuard: if /me succeeds there's already a session, so
// there's no reason to show the login screen.
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: user, isPending } = useMe()

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner variant="throbber" className="size-6" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
}

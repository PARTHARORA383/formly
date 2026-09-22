"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useMe } from "@/lib/query/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: user, isPending, isError } = useMe()

  useEffect(() => {
    if (isError) {
      router.replace("/login")
    }
  }, [isError, router])

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner variant="throbber" className="size-6" />
      </div>
    )
  }

  // Render nothing while the redirect is in flight, rather than flashing the
  // app shell to someone who isn't logged in.
  if (isError || !user) {
    return null
  }

  return <>{children}</>
}

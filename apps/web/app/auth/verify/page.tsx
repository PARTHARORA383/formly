"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useVerify } from "@/lib/query/auth"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const { mutate, isError } = useVerify()
  const fired = useRef(false)

  useEffect(() => {
    if (!token || fired.current) return

    // StrictMode runs effects twice in dev. The token is single-use, so the
    // second call would fail against an already-consumed link.
    fired.current = true

    mutate(token, {
      onSuccess: () => router.push("/dashboard"),
    })
  }, [token, mutate, router])

  const failed = !token || isError

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      {failed ? (
        <>
          <p className="text-sm text-muted-foreground">
            This link is invalid or has expired.
          </p>
          <a href="/login" className="text-sm underline underline-offset-4">
            Back to login
          </a>
        </>
      ) : (
        <>
          <Spinner variant="throbber" className="size-6" />
          <p className="text-sm text-muted-foreground">Verifying your link...</p>
        </>
      )}
    </div>
  )
}

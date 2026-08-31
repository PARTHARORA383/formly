"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@/components/kibo-ui/spinner"
import AuthApi from "@/lib/api/auth"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setError("This link is invalid or has expired.")
      return
    }

    AuthApi.verify(token)
      .then(() => {
        router.push("/")
      })
      .catch(() => {
        setError("This link is invalid or has expired.")
      })
  }, [searchParams, router])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      {error ? (
        <>
          <p className="text-sm text-muted-foreground">{error}</p>
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

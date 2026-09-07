"use client"

import { useEffect, useState } from "react"
import AuthApi from "@/lib/api/auth"

type User = {
  id: number
  name: string | null
  email: string
  avatarUrl: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    AuthApi.me()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  return { user, isLoading, isAuthenticated: !!user }
}



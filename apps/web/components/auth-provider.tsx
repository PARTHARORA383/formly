"use client"

import * as React from "react"
import AuthApi from "@/lib/api/auth"

type User = {
  id: number
  name: string | null
  email: string
  avatarUrl: string | null
}

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refetch: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchUser = React.useCallback(() => {
    setIsLoading(true)
    AuthApi.me()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  React.useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const value = React.useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, refetch: fetchUser }),
    [user, isLoading, fetchUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = React.useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

export { AuthProvider, useAuth }

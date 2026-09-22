import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import AuthApi from "@/lib/api/auth"

type User = {
  id: number
  name: string | null
  email: string
  avatarUrl: string | null
}

const authKeys = {
  me: ["auth", "me"] as const,
}

// The current user. No context needed — React Query's cache is already the
// shared store, so every caller hits the same entry and the same in-flight
// request. `data` is undefined while loading and when logged out.
function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const res = await AuthApi.me()
      return res.data.data as User
    },
    // A 401 means "logged out", not "try again".
    retry: false,
  })
}

function useMagicLink() {
  return useMutation({
    mutationFn: (email: string) => AuthApi.magicLink(email),
  })
}

// A mutation, not a query — /verify consumes a single-use token and sets
// cookies. As a query, React Query could refetch it on remount or reconnect
// and the second call would fail with an already-used token.
function useVerify() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => AuthApi.verify(token),
    onSuccess: () => {
      // Session cookies exist now, so the cached "who am I" is stale.
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export { authKeys, useMe, useMagicLink, useVerify }
export type { User }

/** A user as the API returns it, from GET /auth/me. */
type User = {
  id: number
  name: string | null
  email: string
  avatarUrl: string | null
}

export type { User }

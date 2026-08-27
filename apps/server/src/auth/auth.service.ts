import { db } from '../db/index.js'
import { usersTable } from '../db/schema.js'

type SignupInput = {
  name?: string
  email: string
  password: string
  avatarUrl?: string
}

async function signup(input: SignupInput) {
  const [user] = await db
    .insert(usersTable)
    .values(input)
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    })

  return user
}

const AuthService = {
  signup,
}

export default AuthService

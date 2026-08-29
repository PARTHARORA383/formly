import { db } from '../db/index.js'
import { usersTable } from '../db/schema.js'
import { type MagicLink, type SignupInput } from './auth.types.js'

async function signup(input: SignupInput) {

//check if the user exist in db , if yes return error user already exist sign try login , if no create a user  , before creating a user hash the password , and before that as well 


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

async function magicLink(input : MagicLink) {

// IT SHOULD CHECK IF THE USER exists with the same email or  not if exist do a login else create a new user with emailVerified as false 
console.log('hit me')

return input
}

const AuthService = {
  signup,
  magicLink
}

export default AuthService

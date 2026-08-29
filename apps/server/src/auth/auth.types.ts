import { z } from 'zod'

const signupSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.email(),
    password: z.string().min(8).optional(),
    avatarUrl: z.url().optional(),
})

const magicLinkSchema = z.object({
    email: z.email(),
})

type SignupInput = z.infer<typeof signupSchema>
type MagicLink = z.infer<typeof magicLinkSchema>

export { signupSchema, magicLinkSchema }
export type { SignupInput, MagicLink }
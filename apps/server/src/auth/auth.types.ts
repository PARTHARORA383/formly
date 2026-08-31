import { z } from 'zod'

const magicLinkSchema = z.object({
    email: z.email(),
})
const verifySchema = z.object({
    token: z.string().min(1),
})

type Verify = z.infer<typeof verifySchema>

type MagicLink = z.infer<typeof magicLinkSchema>

export { magicLinkSchema , verifySchema }
export type { MagicLink , Verify}
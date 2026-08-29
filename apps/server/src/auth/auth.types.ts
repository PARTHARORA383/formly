import { z } from 'zod'

const magicLinkSchema = z.object({
    email: z.email(),
})

type MagicLink = z.infer<typeof magicLinkSchema>

export { magicLinkSchema }
export type { MagicLink }
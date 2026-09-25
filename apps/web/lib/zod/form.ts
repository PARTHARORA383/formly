import { z } from "zod"

// Request payloads only — mirrors the server's createFormSchema so the client
// can reject bad input before it goes over the wire.
const createFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
})

type CreateFormInput = z.infer<typeof createFormSchema>

export { createFormSchema }
export type { CreateFormInput }

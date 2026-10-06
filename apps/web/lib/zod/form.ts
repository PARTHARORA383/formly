import { z } from "zod"

// Request payloads only — mirrors the server's createFormSchema so the client
// can reject bad input before it goes over the wire.
const createFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
})

const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "date",
  "dropdown",
  "single_select",
  "multi_select",
])

// Mirrors the server's updateFormSchema. A present id means "update this row",
// an absent one means "insert", so ids and tempIds are passed through untouched.
const updateFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().nullable().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["draft", "published", "closed"]).optional(),
  fields: z.array(
    z.object({
      id: z.number().int().optional(),
      tempId: z.string().optional(),
      type: fieldTypeSchema,
      label: z.string().min(1, "Every question needs a label").max(500),
      description: z.string().nullable().optional(),
      placeholder: z.string().max(255).nullable().optional(),
      required: z.boolean(),
      position: z.number().int(),
      config: z.record(z.string(), z.unknown()),
      options: z
        .array(
          z.object({
            id: z.number().int().optional(),
            label: z.string().min(1, "Every option needs a label").max(500),
          })
        )
        .optional(),
    })
  ),
})

// Mirrors the server's submitFormSchema: one entry per answer, exactly one value
// each, and a multi-select sends one entry per ticked option.
type SubmitFormInput = {
  publicId: string
  answers: {
    fieldId: number
    valueText?: string
    valueNumber?: number
    valueDate?: string
    optionId?: number
  }[]
}

type CreateFormInput = z.infer<typeof createFormSchema>
type UpdateFormInput = z.infer<typeof updateFormSchema>

export { createFormSchema, updateFormSchema }
export type { CreateFormInput, SubmitFormInput, UpdateFormInput }

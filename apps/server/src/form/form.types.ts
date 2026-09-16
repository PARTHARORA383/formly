import  z from "zod"

const createFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    ownerId : z.number()
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

const fieldOptionInputSchema = z.object({
    label: z.string().min(1, "Option label is required").max(500),
})

const fieldInputSchema = z.object({
    type: fieldTypeSchema,
    label: z.string().min(1, "Label is required").max(500),
    description: z.string().nullable().optional(),
    placeholder: z.string().max(255).nullable().optional(),
    required: z.boolean().default(false),
    config: z.record(z.string(), z.unknown()).default({}),
    options: z.array(fieldOptionInputSchema).optional(),
})

const updateFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().nullable().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
    fields: z.array(fieldInputSchema),
})

type CreateFormInput = z.infer<typeof createFormSchema>
type FieldType = z.infer<typeof fieldTypeSchema>
type FieldOptionInput = z.infer<typeof fieldOptionInputSchema>
type FieldInput = z.infer<typeof fieldInputSchema>
type UpdateFormInput = z.infer<typeof updateFormSchema>

export {
    createFormSchema,
    fieldTypeSchema,
    fieldOptionInputSchema,
    fieldInputSchema,
    updateFormSchema,
    type CreateFormInput,
    type FieldType,
    type FieldOptionInput,
    type FieldInput,
    type UpdateFormInput,
}

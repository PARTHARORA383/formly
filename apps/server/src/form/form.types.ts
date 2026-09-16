import  z from "zod"


const createFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),})

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
    // Present = existing row to update, absent = new option to insert
    id: z.number().int().optional(),
    label: z.string().min(1, "Option label is required").max(500),
})

const fieldInputSchema = z.object({
    // Present = existing row to update, absent = new field to insert.
    // Without this the server can't tell the two apart, so every save would
    // archive and re-insert, giving each question a new id and breaking
    // per-field analytics.
    id: z.number().int().optional(),
    // Client-side key for unsaved fields, echoed back beside the real id so
    // the client can reconcile without replacing its local state.
    tempId: z.string().optional(),
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

type CreateFormBody = z.infer<typeof createFormSchema>
// What the service receives: the validated body plus the authenticated owner.
type CreateFormInput = CreateFormBody & { ownerId: number }
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

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
    id: z.number().int().optional(),
    label: z.string().min(1, "Option label is required").max(500),
})

const fieldInputSchema = z.object({
    id: z.number().int().optional(),
    tempId: z.string().optional(),
    type: fieldTypeSchema,
    label: z.string().min(1, "Label is required").max(500),
    description: z.string().nullable().optional(),
    placeholder: z.string().max(255).nullable().optional(),
    required: z.boolean().default(false),
    position: z.number().int().optional(),
    config: z.record(z.string(), z.unknown()).default({}),
    options: z.array(fieldOptionInputSchema).optional(),
})

const updateFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().nullable().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
    status: z.enum(["draft", "published", "closed"]).optional(),
    fields: z.array(fieldInputSchema),
})


const answerInputSchema = z
    .object({
        fieldId: z.number().int().positive(),
        valueText: z.string().max(10_000).optional(),
        valueNumber: z.number().finite().optional(),
        valueDate: z.union([z.iso.date(), z.iso.datetime()]).optional(),
        optionId: z.number().int().positive().optional(),
    })
    .refine(
        (answer) =>
            [answer.valueText, answer.valueNumber, answer.valueDate, answer.optionId].filter(
                (value) => value !== undefined
            ).length === 1,
        { message: "Each answer needs exactly one of valueText, valueNumber, valueDate or optionId" }
    )

const submitFormSchema = z.object({
    publicId: z.string().min(1).max(12),
    answers: z.array(answerInputSchema).max(500),
})

type CreateFormBody = z.infer<typeof createFormSchema>
type CreateFormInput = CreateFormBody & { ownerId: number }
type FieldType = z.infer<typeof fieldTypeSchema>
type FieldOptionInput = z.infer<typeof fieldOptionInputSchema>
type FieldInput = z.infer<typeof fieldInputSchema>
type UpdateFormInput = z.infer<typeof updateFormSchema>
type AnswerInput = z.infer<typeof answerInputSchema>
type SubmitFormInput = z.infer<typeof submitFormSchema>

export {
    createFormSchema,
    fieldTypeSchema,
    fieldOptionInputSchema,
    fieldInputSchema,
    updateFormSchema,
    answerInputSchema,
    submitFormSchema,
    type CreateFormInput,
    type FieldType,
    type FieldOptionInput,
    type FieldInput,
    type UpdateFormInput,
    type AnswerInput,
    type SubmitFormInput,
}

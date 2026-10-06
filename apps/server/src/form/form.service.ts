import { z } from "zod";
import type { AnswerInput, CreateFormInput, SubmitFormInput, UpdateFormInput } from "./form.types.js";
import { db } from "../db/index.js";
import { answersTable, fieldOptionsTable, formFieldsTable, formsTable, responsesTable } from "../db/schema.js";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { generatePublicId } from "../common/utils/id.js";
import ApiError from "../common/utils/error.js";

const FormService = {
    createForm: async (input: CreateFormInput) => {
        const { title, description, ownerId } = input

        const publicId = generatePublicId()

        const [form] = await db.insert(formsTable).values({ title, description, publicId, ownerId: Number(ownerId) }).returning()

        if (!form) {
            throw ApiError.internal('Failed to create form')
        }

        return form
    }
    ,
    getForms: async (ownerId: number) => {
        return db
            .select()
            .from(formsTable)
            .where(eq(formsTable.ownerId, ownerId))
            .orderBy(desc(formsTable.updatedAt))
    }
    ,
    // One form with its live (not archived) fields and options, in the order
    // the builder saved them. Scoped to the owner, so another user's publicId
    // reads as not found rather than forbidden.
    getForm: async (ownerId: number, publicId: string) => {
        const [form] = await db
            .select()
            .from(formsTable)
            .where(and(eq(formsTable.publicId, publicId), eq(formsTable.ownerId, ownerId)))

        if (!form) {
            throw ApiError.notFound('Form not found')
        }

        return { ...form, fields: await loadLiveFields(form.id) }
    }
    ,
    // What a respondent needs to fill the form in, and nothing else: no owner,
    // status, settings or timestamps. Looked up by publicId alone, because the
    // caller may not be logged in.
    //
    // Who gets it:
    //   published form  -> anyone
    //   anything else   -> only its owner, flagged as a preview
    //   everyone else   -> 404, the same as a form that does not exist, so a
    //                      private form cannot be told apart from a missing one
    getPublicForm: async (publicId: string, viewerId?: number) => {
        const [form] = await db
            .select()
            .from(formsTable)
            .where(eq(formsTable.publicId, publicId))

        const isPublished = form?.status === 'published'
        const isOwner = form !== undefined && viewerId !== undefined && form.ownerId === viewerId

        if (!form || (!isPublished && !isOwner)) {
            throw ApiError.notFound('Form not found')
        }

        const fields = await loadLiveFields(form.id)

        return {
            publicId: form.publicId,
            title: form.title,
            description: form.description,
            // True when the viewer is the owner looking at a form that is not
            // published. The page uses it to show a banner and block submitting.
            preview: !isPublished,
            // Only the settings a respondent's page uses, never the whole column.
            settings: {
                fontFamily: typeof (form.settings as Record<string, unknown>)?.fontFamily === 'string'
                    ? ((form.settings as Record<string, unknown>).fontFamily as string)
                    : undefined,
            },
            fields: fields.map((field) => ({
                id: field.id,
                type: field.type,
                label: field.label,
                description: field.description,
                placeholder: field.placeholder,
                required: field.required,
                position: field.position,
                ...(field.options ? { options: field.options } : {}),
            })),
        }
    }
    ,
    // A respondent submitting a form. Nobody is logged in here, so everything
    // that makes the data trustworthy is checked in this function:
    //   1. the form exists and is published (anything else reads as not found)
    //   2. every answer belongs to a live question of THIS form
    //   3. every answer is the right kind for its question, and required
    //      questions are answered
    // and only then is the response written, together with its answers, in one
    // transaction: there is never a response row without its answers.
    submitForm: async (
        input: SubmitFormInput,
        meta: { ipAddress?: string | undefined; userAgent?: string | undefined },
    ) => {
        const [form] = await db
            .select()
            .from(formsTable)
            .where(eq(formsTable.publicId, input.publicId))

        // The same answer for "no such form" and "not published", so a private
        // form cannot be told apart from a missing one.
        if (!form || form.status !== 'published') {
            throw ApiError.notFound('Form not found')
        }

        const fields = await loadLiveFields(form.id)
        const rows = buildAnswerRows(fields, input.answers)

        if (rows.length === 0) {
            throw ApiError.badRequest('Answer at least one question')
        }

        return db.transaction(async (tx) => {
            const [response] = await tx
                .insert(responsesTable)
                .values({
                    formId: form.id,
                    // The columns are sized for these; longer values are cut,
                    // never rejected, since they only exist for spam control.
                    ipAddress: meta.ipAddress?.slice(0, 45) ?? null,
                    userAgent: meta.userAgent?.slice(0, 512) ?? null,
                })
                .returning({ id: responsesTable.id })

            if (!response) {
                throw ApiError.internal('Failed to save the response')
            }

            await tx.insert(answersTable).values(rows.map((row) => ({ ...row, responseId: response.id })))

            return { responseId: response.id }
        })
    }
    ,
    updateForm: async (ownerId: number, publicId: string, input: UpdateFormInput) => {

        const { title, description, settings, status, fields } = input

        return db.transaction(async (tx) => {
            const [form] = await tx
                .select()
                .from(formsTable)
                .where(and(eq(formsTable.publicId, publicId), eq(formsTable.ownerId, ownerId)))

            if (!form) {
                throw ApiError.notFound('Form not found')
            }

            const [updatedForm] = await tx
                .update(formsTable)
                .set({
                    title,
                    description,
                    settings,
                    // undefined leaves the column as it is.
                    status,
                    // First publish stamps the date; later saves and unpublishing
                    // keep it, so it records when the form first went live.
                    ...(status === 'published' && !form.publishedAt ? { publishedAt: new Date() } : {}),
                    updatedAt: new Date(),
                })
                .where(eq(formsTable.id, form.id))
                .returning()

            const existingFields = await tx
                .select()
                .from(formFieldsTable)
                .where(and(eq(formFieldsTable.formId, form.id), isNull(formFieldsTable.archivedAt)))

            const existingById = new Map(existingFields.map((f) => [f.id, f]))
            const seenFieldIds = new Set<number>()

            const savedFields = []

            for (const [index, incoming] of input.fields.entries()) {
                const current = incoming.id ? existingById.get(incoming.id) : undefined

                const values = {
                    formId: form.id,
                    type: incoming.type,
                    label: incoming.label,
                    description: incoming.description ,
                    placeholder: incoming.placeholder,
                    required: incoming.required,
                    position: incoming.position ?? index,
                    config: incoming.config,
                }

                let fieldId: number

                if (current && current.type === incoming.type) {
                    const [updated] = await tx
                        .update(formFieldsTable)
                        .set({ ...values, updatedAt: new Date() })
                        .where(eq(formFieldsTable.id, current.id))
                        .returning()
                    fieldId = updated!.id
                    seenFieldIds.add(current.id)
                } else {
                    // Either brand new, or the type changed — a different type is a
                    // different question, so the old row is archived and answers
                    // stay attached to it.
                    if (current) {
                        await tx
                            .update(formFieldsTable)
                            .set({ archivedAt: new Date() })
                            .where(eq(formFieldsTable.id, current.id))
                        seenFieldIds.add(current.id)
                    }

                    const [inserted] = await tx.insert(formFieldsTable).values(values).returning()
                    fieldId = inserted!.id
                }

                const options = await syncOptions(tx, fieldId, incoming.options ?? [])

                savedFields.push({
                    id: fieldId,
                    ...(incoming.tempId ? { tempId: incoming.tempId } : {}),
                    ...values,
                    options,
                })
            }

            // Anything the payload left out is archived, never deleted —
            // answers.fieldId cascades, so a delete would destroy responses.
            const removed = existingFields.filter((f) => !seenFieldIds.has(f.id)).map((f) => f.id)

            if (removed.length > 0) {
                await tx
                    .update(formFieldsTable)
                    .set({ archivedAt: new Date() })
                    .where(inArray(formFieldsTable.id, removed))
            }

            return { ...updatedForm!, fields: savedFields }
        })
    }
}

// A form's live fields in saved order, each with its live options. Shared by
// the owner's builder load and the public page, so both see the same shape.
async function loadLiveFields(formId: number) {
    const fields = await db
        .select()
        .from(formFieldsTable)
        .where(and(eq(formFieldsTable.formId, formId), isNull(formFieldsTable.archivedAt)))
        .orderBy(asc(formFieldsTable.position))

    const options = fields.length === 0
        ? []
        : await db
            .select()
            .from(fieldOptionsTable)
            .where(and(
                inArray(fieldOptionsTable.fieldId, fields.map((f) => f.id)),
                isNull(fieldOptionsTable.archivedAt),
            ))
            .orderBy(asc(fieldOptionsTable.position))

    const optionsByField = new Map<number, { id: number; label: string }[]>()
    for (const option of options) {
        const list = optionsByField.get(option.fieldId) ?? []
        list.push({ id: option.id, label: option.label })
        optionsByField.set(option.fieldId, list)
    }

    return fields.map(({ archivedAt, formId: _formId, ...field }) => ({
        ...field,
        // Only choice questions have options, so the key is left off the rest.
        ...(optionsByField.has(field.id) ? { options: optionsByField.get(field.id) } : {}),
    }))
}

type LiveField = Awaited<ReturnType<typeof loadLiveFields>>[number]
type AnswerRow = Omit<typeof answersTable.$inferInsert, 'responseId'>

const TEXT_TYPES = new Set(['short_text', 'long_text', 'email'])
const CHOICE_TYPES = new Set(['dropdown', 'single_select', 'multi_select'])

// Turns what the respondent sent into the rows for the answers table, or throws
// 400 naming the question that is wrong. The request schema has already
// guaranteed the shape (one value per answer); this is where each answer is
// matched against the question it claims to answer.
function buildAnswerRows(fields: LiveField[], answers: AnswerInput[]): AnswerRow[] {
    const fieldsById = new Map(fields.map((field) => [field.id, field]))
    const byField = new Map<number, AnswerInput[]>()

    for (const answer of answers) {
        // Questions that were archived, or belong to another form, are unknown.
        if (!fieldsById.has(answer.fieldId)) {
            throw ApiError.badRequest(`Unknown question: ${answer.fieldId}`)
        }
        byField.set(answer.fieldId, [...(byField.get(answer.fieldId) ?? []), answer])
    }

    const rows: AnswerRow[] = []

    for (const field of fields) {
        const given = byField.get(field.id) ?? []
        const mine = rowsForField(field, given)

        if (field.required && mine.length === 0) {
            throw ApiError.badRequest(`"${field.label}" is required`)
        }

        rows.push(...mine)
    }

    return rows
}

function rowsForField(field: LiveField, given: AnswerInput[]): AnswerRow[] {
    if (given.length === 0) return []

    const wrong = (what: string) => ApiError.badRequest(`"${field.label}" ${what}`)

    if (CHOICE_TYPES.has(field.type)) {
        if (given.some((answer) => answer.optionId === undefined)) throw wrong('needs a choice')

        const ids = given.map((answer) => answer.optionId!)
        if (new Set(ids).size !== ids.length) throw wrong('has the same choice more than once')
        if (field.type !== 'multi_select' && ids.length > 1) throw wrong('takes one choice only')

        // Only this question's live options count, not just any option id.
        const valid = new Set((field.options ?? []).map((option) => option.id))
        if (ids.some((id) => !valid.has(id))) throw wrong('has a choice that is not one of its options')

        return ids.map((optionId) => ({ fieldId: field.id, optionId }))
    }

    // Every other type takes one answer.
    if (given.length > 1) throw wrong('can only be answered once')
    const answer = given[0]!

    if (TEXT_TYPES.has(field.type)) {
        if (answer.valueText === undefined) throw wrong('needs a text answer')

        // Blank means unanswered, which only matters if the question is required.
        const text = answer.valueText.trim()
        if (text === '') return []
        if (field.type === 'email' && !z.email().safeParse(text).success) throw wrong('needs a valid email address')

        return [{ fieldId: field.id, valueText: text }]
    }

    if (field.type === 'number') {
        if (answer.valueNumber === undefined) throw wrong('needs a number')
        // numeric columns are handled as strings by the driver.
        return [{ fieldId: field.id, valueNumber: String(answer.valueNumber) }]
    }

    if (field.type === 'date') {
        if (answer.valueDate === undefined) throw wrong('needs a date')
        const date = new Date(answer.valueDate)
        if (Number.isNaN(date.getTime())) throw wrong('needs a valid date')
        return [{ fieldId: field.id, valueDate: date }]
    }

    throw wrong('cannot be answered')
}

// Same three rules as fields, one level down.
async function syncOptions(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    fieldId: number,
    incoming: { id?: number | undefined; label: string }[],
) {
    const existing = await tx
        .select()
        .from(fieldOptionsTable)
        .where(and(eq(fieldOptionsTable.fieldId, fieldId), isNull(fieldOptionsTable.archivedAt)))

    const existingById = new Map(existing.map((o) => [o.id, o]))
    const seen = new Set<number>()
    const saved = []

    for (const [index, option] of incoming.entries()) {
        const current = option.id ? existingById.get(option.id) : undefined

        if (current) {
            const [updated] = await tx
                .update(fieldOptionsTable)
                .set({ label: option.label, position: index })
                .where(eq(fieldOptionsTable.id, current.id))
                .returning()
            seen.add(current.id)
            saved.push(updated!)
        } else {
            const [inserted] = await tx
                .insert(fieldOptionsTable)
                .values({ fieldId, label: option.label, position: index })
                .returning()
            saved.push(inserted!)
        }
    }

    const removed = existing.filter((o) => !seen.has(o.id)).map((o) => o.id)

    if (removed.length > 0) {
        await tx
            .update(fieldOptionsTable)
            .set({ archivedAt: new Date() })
            .where(inArray(fieldOptionsTable.id, removed))
    }

    return saved
}

export default FormService

import type { CreateFormInput, UpdateFormInput } from "./form.types.js";
import { db } from "../db/index.js";
import { fieldOptionsTable, formFieldsTable, formsTable } from "../db/schema.js";
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

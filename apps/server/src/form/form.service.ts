import type { CreateFormInput, UpdateFormInput } from "./form.types.js";
import { db } from "../db/index.js";
import { fieldOptionsTable, formFieldsTable, formsTable } from "../db/schema.js";
import { and, eq, inArray, isNull } from "drizzle-orm";
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
    updateForm: async (ownerId: number, publicId: string, input: UpdateFormInput) => {
        return db.transaction(async (tx) => {
            const [form] = await tx
                .select()
                .from(formsTable)
                .where(and(eq(formsTable.publicId, publicId), eq(formsTable.ownerId, ownerId)))

            // 404 rather than 403 — don't reveal that someone else's form exists.
            if (!form) {
                throw ApiError.notFound('Form not found')
            }

            const [updatedForm] = await tx
                .update(formsTable)
                .set({
                    title: input.title,
                    description: input.description ?? null,
                    ...(input.settings ? { settings: input.settings } : {}),
                    // defaultNow() only fires on insert, so bump it explicitly.
                    updatedAt: new Date(),
                })
                .where(eq(formsTable.id, form.id))
                .returning()

            const existingFields = await tx
                .select()
                .from(formFieldsTable)
                .where(and(eq(formFieldsTable.formId, form.id), isNull(formFieldsTable.archivedAt)))

            // Only ids already on THIS form may be treated as updates — otherwise
            // a client could pass someone else's field id and edit their form.
            const existingById = new Map(existingFields.map((f) => [f.id, f]))
            const seenFieldIds = new Set<number>()

            const savedFields = []

            for (const [index, incoming] of input.fields.entries()) {
                const current = incoming.id ? existingById.get(incoming.id) : undefined

                const values = {
                    formId: form.id,
                    type: incoming.type,
                    label: incoming.label,
                    description: incoming.description ?? null,
                    placeholder: incoming.placeholder ?? null,
                    required: incoming.required,
                    position: index,
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

import type { CreateFormInput, UpdateFormInput } from "./form.types.js";
import { db } from "../db/index.js";
import { formsTable } from "../db/schema.js";
import { buildSlug, generatePublicId } from "../common/utils/slug.js";
import ApiError from "../common/utils/error.js";

const FormService = {
    createForm: async (input: CreateFormInput) => {
        const { title, description, ownerId } = input

        const publicId = generatePublicId()
        const slug = buildSlug(title, publicId)

        const [form] = await db.insert(formsTable).values({ title, description, publicId, slug, ownerId: Number(ownerId) }).returning()

        if (!form) {
            throw ApiError.internal('Failed to create form')
        }

        return form
    }
    , 
    updateForm: async (ownerId: number, publicId: string, input: UpdateFormInput) => {
        // TODO: diff input.fields against form_fields in one transaction
    }
}

export default FormService
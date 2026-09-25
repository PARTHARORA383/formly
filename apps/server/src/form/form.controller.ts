import type { Request, Response, NextFunction } from "express"
import ApiResponse from "../common/utils/response.js"
import ApiError from "../common/utils/error.js"
import { ZodError } from "zod"
import FormService from "./form.service.js"

const FormController = {

    createForm: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, description } = req.body
            const ownerId = req.userId
            const form = await FormService.createForm({ title, description, ownerId: Number(ownerId) })
            ApiResponse.created(res, form, 'Form created successfully')
        } catch (err) {
            if (err instanceof ZodError) {
                next(ApiError.badRequest('Invalid input', err.issues))
                return
            }
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
    getForms: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const forms = await FormService.getForms(Number(req.userId))
            ApiResponse.success(res, forms, 'Forms fetched successfully')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
    updateForm: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const publicId = String(req.params.publicId)
            const form = await FormService.updateForm(Number(req.userId), publicId, req.body)
            ApiResponse.success(res, form, 'Form updated successfully')
        } catch (err) {
            if (err instanceof ZodError) {
                next(ApiError.badRequest('Invalid input', err.issues))
                return
            }
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    }

}

export default FormController
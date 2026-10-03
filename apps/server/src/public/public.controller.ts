import type { Request, Response, NextFunction } from "express"
import ApiResponse from "../common/utils/response.js"
import ApiError from "../common/utils/error.js"
import FormService from "../form/form.service.js"

const PublicController = {
    // Open to everyone. A logged-in owner is recognised, but not required.
    getForm: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // userId is set only when a valid login cookie came with the request.
            const viewerId = req.userId ? Number(req.userId) : undefined
            const form = await FormService.getPublicForm(String(req.params.publicId), viewerId)
            ApiResponse.success(res, form, 'Form fetched successfully')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
}

export default PublicController

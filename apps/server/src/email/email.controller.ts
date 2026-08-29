import type { Request, Response, NextFunction } from 'express'
import EmailService from '../common/services/email.service.js'
import ApiResponse from '../common/utils/response.js'
import ApiError from '../common/utils/error.js'

const EmailController = {
    send: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, name } = req.body

            if (!email) {
                throw ApiError.badRequest('email is required')
            }

            await EmailService.sendWelcomeEmail(email, name)
            ApiResponse.success(res, null, 'Email sent')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
}

export default EmailController

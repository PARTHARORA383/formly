import type { Request, Response, NextFunction } from 'express'
import AuthService from './auth.service.js'
import ApiResponse from '../common/utils/response.js'
import ApiError from '../common/utils/error.js'

const AuthController = {
    signup: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await AuthService.signup(req.body)
            ApiResponse.created(res, user, 'User created successfully')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },

    magicLink: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await AuthService.magicLink(req.body)
            ApiResponse.created(res, user, 'User created successfully')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    }
}

export default AuthController

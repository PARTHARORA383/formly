import type { Request, Response, NextFunction } from 'express'
import AuthService from './auth.service.js'
import ApiResponse from '../common/utils/response.js'
import ApiError from '../common/utils/error.js'
import { ZodError } from 'zod'
import { env } from '../env.js'

const AuthController = {
    magicLink: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await AuthService.magicLink(req.body)
            ApiResponse.created(res, user, 'User created successfully')
        } catch (err) {
            if (err instanceof ZodError) {
                next(ApiError.badRequest('Invalid input', err.issues))
                return
            }
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },

    verify: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user, accessToken, refreshToken } = await AuthService.verify(req.body)

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: env.node === 'production',
                sameSite: env.cookieSameSite,
                maxAge: 15 * 60 * 1000, // 15 min
            })

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: env.node === 'production',
                sameSite: env.cookieSameSite,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            })

            ApiResponse.success(res, user, 'Verified successfully')
        } catch (err) {
            if (err instanceof ZodError) {
                next(ApiError.badRequest('Invalid input', err.issues))
                return
            }
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
    refresh: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken
            if (!refreshToken) {
                throw ApiError.badRequest('No refresh token')
            }

            const { accessToken , newRefreshToken} = await AuthService.refresh(refreshToken)

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: env.node === 'production',
                sameSite: env.cookieSameSite,
                maxAge: 15 * 60 * 1000,
            })

            
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: env.node === 'production',
                sameSite: env.cookieSameSite,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            })

            ApiResponse.success(res, null, 'Refreshed')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
    me: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await AuthService.me(req.userId!)
            ApiResponse.success(res, user, 'Fetched successfully')
        } catch (err) {
            next(err instanceof ApiError ? err : ApiError.internal())
        }
    },
}

export default AuthController

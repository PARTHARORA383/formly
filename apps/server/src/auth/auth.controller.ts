import type { Request, Response, NextFunction } from 'express'
import AuthService from './auth.service.js'
import ApiResponse from '../common/utils/response.js'
import ApiError from '../common/utils/error.js'
import { magicLinkSchema } from './auth.types.js'
import { ZodError } from 'zod'
import { verify } from 'node:crypto'

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
verify : async (req : Request , res : Response)=>{
    try{
        const isVerified = await AuthService.verify(req.body)
    }catch(e){

    }
}
}

export default AuthController

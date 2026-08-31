import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import ApiError from "../utils/error.js";
import { env } from "../../env.js";


function validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (err) {
            if (err instanceof ZodError) {
                ApiError.badRequest('Validation failed', env.node === 'development' ? err.issues : []).send(res)
                return
            }
            next(err)
        }
    }
}

export default validateBody;
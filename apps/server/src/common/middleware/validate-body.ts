import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";


function validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
}

export default validateBody;
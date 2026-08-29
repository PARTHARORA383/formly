import type { Request, Response, NextFunction } from 'express'
import ApiError from '../utils/error.js'

function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    err.send(res)
    return
  }

  console.error(err)
  new ApiError(500, 'Internal Server Error').send(res)
}

export default errorHandler

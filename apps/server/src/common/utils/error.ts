import type { Response } from 'express'

class ApiError extends Error {
  status: number
  data: null
  errors: unknown[]

  constructor(
    status: number,
    message: string = 'Something went wrong',
    errors: unknown[] = []
  ) {
    super(message)
    this.status = status
    this.data = null
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }

  send(res: Response) {
    res.status(this.status).json({
      success: false,
      message: this.message,
      errors: this.errors,
    })
  }

  static badRequest(message: string = 'bad request', errors: unknown[] = []) {
    return new ApiError(400, message, errors)
  }

  static unauthorized(message: string = 'unauthorized', errors: unknown[] = []) {
    return new ApiError(401, message, errors)
  }

  static notFound(message: string = 'not found', errors: unknown[] = []) {
    return new ApiError(404, message, errors)
  }

  static internal(message: string = 'internal server error', errors: unknown[] = []) {
    return new ApiError(500, message, errors)
  }

  static tooManyRequests(message: string = 'too many requests', errors: unknown[] = []) {
    return new ApiError(429, message, errors)
  }
}

export default ApiError
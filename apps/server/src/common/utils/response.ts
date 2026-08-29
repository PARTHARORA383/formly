import type { Response } from 'express'

class ApiResponse {
    status: number
    data: unknown
    message: string

    constructor(status: number, data: unknown, message: string) {
        this.status = status
        this.data = data
        this.message = message
    }

    send(res: Response) {
        res.status(this.status).json({
            success: true,
            message: this.message,
            data: this.data,
        })
    }

    static success(res: Response, data: unknown, message: string = 'ok') {
        return new ApiResponse(200, data, message).send(res)
    }

    static created(res: Response, data: unknown, message: string = 'created') {
        return new ApiResponse(201, data, message).send(res)
    }
}

export default ApiResponse
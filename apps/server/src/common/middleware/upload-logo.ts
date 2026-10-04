import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import ApiError from '../utils/error.js'

const MAX_LOGO_BYTES = 2 * 1024 * 1024


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_LOGO_BYTES, files: 1 },
}).single('logo')

// multer reports its own errors; turn them into ours so the client gets a
// clear message rather than a stack trace.
function uploadLogo(req: Request, res: Response, next: NextFunction) {
    upload(req, res, (err: unknown) => {
        if (!err) {
            next()
            return
        }

        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            next(ApiError.badRequest('The logo must be 2 MB or smaller'))
            return
        }

        next(ApiError.badRequest('Could not read the upload'))
    })
}

export default uploadLogo

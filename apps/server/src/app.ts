
import express, { type Request, type Response } from 'express'
import authRouter from './auth/auth.route.js'
import emailRouter from './email/email.route.js'
import errorHandler from './common/middleware/error.middleware.js'


export function createApp() {

    const app = express()

    app.use(express.json())

    app.use('/api/v1/auth', authRouter)
    app.use('/api/v1/email', emailRouter)

    app.get('/health', (req: Request, res: Response) => {
        res.status(200 ).json({
            message : 'Hello from the form builder backend'
        })
    })

    app.use(errorHandler)

    return app;
}
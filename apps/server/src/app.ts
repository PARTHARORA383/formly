
import express, { type Request, type Response } from 'express'
import authRouter from './auth/auth.route.js'
import emailRouter from './email/email.route.js'
import cors from 'cors'
import { env } from './env.js'

export function createApp() {

    const app = express()

    app.use(express.json())

    app.use('/api/v1/auth', authRouter)
    app.use('/api/v1/email', emailRouter)


    app.use(cors({ origin: env.cors, credentials: true }))
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({
            message: 'Hello from the form builder backend'
        })
    })



    return app;
}

import express, { type Request, type Response } from 'express'
import authRouter from './auth/auth.route.js'
import emailRouter from './email/email.route.js'
import cors from 'cors'
import { env } from './env.js'
import cookieParser from 'cookie-parser'

export function createApp() {

    const app = express()
    app.use(cors({ origin: env.cors, credentials: true }))

    app.use(express.json())
    app.use(cookieParser())

    app.use('/api/v1/auth', authRouter)
    app.use('/api/v1/email', emailRouter)


    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({
            message: 'Hello from the form builder backend'
        })
    })



    return app;
}
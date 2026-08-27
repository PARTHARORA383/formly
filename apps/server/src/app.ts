
import express, { type Request, type Response } from 'express'
import authRouter from './auth/auth.route.js'


export function createApp() {

    const app = express()

    app.use(express.json())

    app.use('/api/auth', authRouter)

    app.get('/health', (req: Request, res: Response) => {
        res.status(200 ).json({
            message : 'Hello from the form builder backend'
        })
    })


    return app;
}
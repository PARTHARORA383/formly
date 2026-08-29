import { Router } from 'express'
import EmailController from './email.controller.js'

const router = Router()

router.post('/send', EmailController.send)

export default router

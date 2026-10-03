import { Router } from "express"
import PublicController from "./public.controller.js"
import authenticateOptional from "../common/middleware/authenticate-optional.js"

// Everything under /public is reachable without logging in, so no route here
// may use the authenticate middleware. authenticateOptional only identifies
// the caller when it can; it never rejects.
const router = Router()

router.get('/forms/:publicId', authenticateOptional, PublicController.getForm)

export default router

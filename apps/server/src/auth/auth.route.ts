import { Router } from 'express'
import AuthController from './auth.controller.js'
import validateBody from '../common/middleware/validate-body.js'
import authenticate from '../common/middleware/authenticate.js'
import { magicLinkSchema, verifySchema } from './auth.types.js'

const router = Router()

router.post('/magic-link', validateBody(magicLinkSchema), AuthController.magicLink)
router.post('/verify', validateBody(verifySchema), AuthController.verify)
router.post('/refresh', AuthController.refresh)
router.get('/me', authenticate, AuthController.me)

// Social login — :provider resolves against the registry in ./providers
router.get('/:provider', AuthController.oauthRedirect)
router.get('/:provider/callback', AuthController.oauthCallback)

export default router
import {Router } from 'express'
import AuthController from './auth.controller.js';
import validateBody from '../common/middleware/validate-body.js';
import { magicLinkSchema, verifySchema } from './auth.types.js';

const router = Router();

router.post('/magic-link' , validateBody(magicLinkSchema),AuthController.magicLink)

router.post('/verify', validateBody(verifySchema), AuthController.verify)

export default router
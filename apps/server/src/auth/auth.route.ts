import {Router } from 'express'
import AuthController from './auth.controller.js';
import validateBody from '../common/middleware/validate-body.js';
import { magicLinkSchema } from './auth.types.js';

const router = Router();

router.post('/magic-link' , validateBody(magicLinkSchema),AuthController.magicLink)

router.post('/verify',AuthController.verify )

export default router
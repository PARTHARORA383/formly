import {Router } from 'express'
import AuthController from './auth.controller.js';

const router = Router();

router.post('/signup', AuthController.signup)

router.post('/magic-link' ,AuthController.magicLink )

export default router
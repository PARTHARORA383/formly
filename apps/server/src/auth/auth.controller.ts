import type { Request, Response, NextFunction } from 'express'
import AuthService from './auth.service.js'

const AuthController = {
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.signup(req.body)
      res.status(201).json(user)
    } catch (err) {
      next(err)
    }
  },
}

export default AuthController

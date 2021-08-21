import {
  Router, CookieOptions, Request, Response,
} from 'express'
import asyncHandler from 'express-async-handler'
import AuthService from '../services/AuthService'
import { verifyIfNotLoggedInYet } from '../../controllers/authController'
import { UnknownServerError } from '../../routes/errors'
import passport from '../../controllers/utils/passport'
import config from '../../../config'

export type AuthServiceInterface = {
  createToken(user: Express.User): string
}

const login = asyncHandler(async (req, res) => {
  const { user } = req
  if (!user) {
    throw new UnknownServerError()
  }

  // トークン生成
  const cookieOptions: CookieOptions = {
    httpOnly: config.NODE_ENV === 'production',
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 12,
    signed: true,
  }
  const token = AuthService.createToken(user)

  // クッキーを設定
  res.cookie('authToken', token, cookieOptions)
  return res.send({ user, token })
})

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('authToken')
  res.send('Logged out successfully!')
}

const routes = Router()

routes.post('/login', verifyIfNotLoggedInYet, passport.authenticate('client-local', { session: false }), login)
routes.post('/silent_refresh', passport.authenticate('client-jwt', { session: false }), login)
routes.get('/logout', passport.authenticate('client-jwt', { session: false }), logout)

export default routes

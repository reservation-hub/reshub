import {
  Request, Response, NextFunction, CookieOptions, Router,
} from 'express'
import asyncHandler from 'express-async-handler'

import passport from './utils/passport'
import config from '../../config'
import { User } from '../entities/User'
import AuthService from '../services/AuthService'
import googleSchema from './schemas/google'

export type AuthServiceInterface = {
  createToken(user: Express.User): Promise<string>,
  verifyIfUserInTokenIsLoggedIn(authToken: any, headerToken?: string): Promise<void>,
  googleAuthenticate(token: string): Promise<User>,
  hack(): Promise<User>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const login = asyncHandler(async (req, res, next) => {
  const { user } = req
  if (!user) return next({ code: 500 })

  // トークン生成
  const cookieOptions: CookieOptions = {
    httpOnly: config.NODE_ENV === 'production',
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 12,
    signed: true,
  }
  const token = AuthService.createToken(user)
  if (!token) return next({ code: 500 })

  // クッキーを設定
  res.cookie('authToken', token, cookieOptions)
  return res.send({ user, token })
})

export const verifyIfNotLoggedInYet = asyncHandler(async (req, res, next) => {
  const { signedCookies } = req

  if (!signedCookies || !signedCookies.authToken) return next()
  let headerToken
  if (req.get('authorization')) {
    headerToken = req.get('authorization')?.split(' ')[1]
  }
  await AuthService.verifyIfUserInTokenIsLoggedIn(signedCookies.authToken, headerToken)
  return next()
})

export const googleAuthenticate = asyncHandler(async (req, res, next) => {
  const schemaValues = await googleSchema.validateAsync(req.body, joiOptions)
  const user = await AuthService.googleAuthenticate(schemaValues.tokenId)

  req.user = user
  return next()
})

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('authToken')
  res.send('Logged out successfully!')
}

// HACK test endpoint to get token and header
export const hack = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await AuthService.hack()
  req.user = user
  return next()
})

const routes = Router()

routes.post('/google', verifyIfNotLoggedInYet, googleAuthenticate, login)
routes.post('/login', verifyIfNotLoggedInYet, passport.authenticate('local', { session: false }), login)
routes.post('/silent_refresh', passport.authenticate('jwt', { session: false }), login)
routes.get('/logout', passport.authenticate('jwt', { session: false }), logout)
routes.get('/hack', hack, login)

export default routes

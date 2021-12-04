import {
  Request, Response, NextFunction, CookieOptions, Router,
} from 'express'

import passport from '@middlewares/passport'
import { User } from '@entities/User'
import AuthService from '@services/AuthService'
import { UnknownServerError } from '@routes/errors'
import config from '@/config'
import googleSchema from './schemas/google'

export type AuthServiceInterface = {
  createToken(user: Express.User, expiresIn: string): string,
  verifyIfUserInTokenIsLoggedIn(authToken: string, headerToken?: string): Promise<void>,
  silentRefreshTokenChecks(authToken: string, refreshToken: string, headerToken?: string): Promise<void>,
  googleAuthenticate(token: string): Promise<User>,
  hack(role?: string): Promise<User>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

export const login = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    if (!user) {
      throw new UnknownServerError()
    }

    // トークン生成
    const cookieOptions: CookieOptions = {
      httpOnly: config.NODE_ENV === 'production',
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      signed: true,
    }
    const token = AuthService.createToken(user, '1d')
    const refreshToken = AuthService.createToken(user, '30d')
    // クッキーを設定
    res.cookie('authToken', token, cookieOptions)
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 30 })
    return res.send({ user, token })
  } catch (e) { return next(e) }
}

export const refreshLogin = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    if (!user) {
      throw new UnknownServerError()
    }
    const cookieOptions: CookieOptions = {
      httpOnly: config.NODE_ENV === 'production',
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      signed: true,
    }
    const token = AuthService.createToken(user, '1d')
    res.cookie('authToken', token, cookieOptions)
    return res.send({ user, token })
  } catch (e) { return next(e) }
}

export const verifyIfNotLoggedInYet = async (req: Request, res: Response, next: NextFunction)
 : Promise<void> => {
  try {
    const { signedCookies } = req

    // in the case login has not occurred checks
    if (!signedCookies || !signedCookies.authToken) return next()

    // in the case login has occurred
    let headerToken
    if (req.get('authorization')) {
      headerToken = req.get('authorization')?.split(' ')[1]
    }
    await AuthService.verifyIfUserInTokenIsLoggedIn(signedCookies.authToken, headerToken)
    return next()
  } catch (e) { return next(e) }
}

export const silentRefreshParamsCheck = async (req: Request, res: Response, next: NextFunction)
  : Promise<void> => {
  try {
    const { signedCookies } = req

    let headerToken
    if (req.get('authorization')) {
      headerToken = req.get('authorization')?.split(' ')[1]
    }
    await AuthService.silentRefreshTokenChecks(signedCookies.authToken, signedCookies.refreshToken, headerToken)
    return next()
  } catch (e) { return next(e) }
}

export const googleAuthenticate = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  try {
    const schemaValues = await googleSchema.validateAsync(req.body, joiOptions)
    const user = await AuthService.googleAuthenticate(schemaValues.tokenId)

    req.user = user
    return next()
  } catch (e) { return next(e) }
}

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('authToken')
  res.send('Logged out successfully!')
}

// HACK test endpoint to get token and header
export const hack = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  const user = await AuthService.hack()
  req.user = user
  return next()
}

export const staffHack = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  const user = await AuthService.hack('staff')
  req.user = user
  return next()
}

const routes = Router()

routes.post('/google', verifyIfNotLoggedInYet, googleAuthenticate, login)
routes.post('/login', verifyIfNotLoggedInYet, passport.authenticate('admin-local', { session: false }), login)
routes.post('/silent_refresh', silentRefreshParamsCheck,
  passport.authenticate('refresh-jwt', { session: false }), login)
routes.get('/logout', passport.authenticate('admin-jwt', { session: false }), logout)
routes.get('/hack', hack, login)
routes.get('/hack_staff', staffHack, login)

export default routes

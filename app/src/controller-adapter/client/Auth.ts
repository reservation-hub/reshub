import {
  Request, Response, NextFunction, CookieOptions, Router,
} from 'express'
import config from '@config'
import { UserForAuth } from '@entities/User'
import { UnknownServerError } from '@errors/RouteErrors'
import passport from '@client/auth/middlewares/passport'
import AuthController from '@client/auth/AuthController'

export type AuthControllerInterface = {
  hack(): Promise<UserForAuth>
  createOneDayToken(user: UserForAuth): string
  createThirtyDaysToken(user: UserForAuth): string
  verifyIfUserInTokenIsLoggedIn(authToken: string, headerToken?: string): Promise<void>
  silentRefreshTokenChecks(authToken: string, refreshToken: string, headerToken?: string): Promise<void>
  googleAuthenticate(query: { provider: string, tokenId: string }): Promise<UserForAuth>
}

const cookieOptions: CookieOptions = {
  httpOnly: config.NODE_ENV === 'production',
  secure: config.NODE_ENV === 'production',
  sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 12,
  signed: true,
}

export const login = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    if (!user) {
      throw new UnknownServerError('User not found in request')
    }

    // トークン生成
    const token = AuthController.createOneDayToken(user)
    const refreshToken = AuthController.createThirtyDaysToken(user)

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
      throw new UnknownServerError('User not found in request')
    }
    const token = AuthController.createOneDayToken(user)
    res.cookie('authToken', token, cookieOptions)
    return res.send({ user, token })
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
    await AuthController.silentRefreshTokenChecks(signedCookies.authToken, signedCookies.refreshToken, headerToken)
    return next()
  } catch (e) { return next(e) }
}

export const googleAuthenticate = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  try {
    const { body } = req
    req.user = await AuthController.googleAuthenticate(body)
    return next()
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
    await AuthController.verifyIfUserInTokenIsLoggedIn(signedCookies.authToken, headerToken)
    return next()
  } catch (e) { return next(e) }
}

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('authToken')
  res.send('Logged out successfully!')
}

export const hack = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    req.user = await AuthController.hack()
    return next()
  } catch (e) { return next(e) }
}

const routes = Router()

routes.post('/google', verifyIfNotLoggedInYet, googleAuthenticate, login)
routes.post('/login', verifyIfNotLoggedInYet, passport.authenticate('client-local', { session: false }), login)
routes.post('/silent_refresh', passport.authenticate('client-refresh', { session: false }), login)
routes.get('/logout', passport.authenticate('client-jwt', { session: false }), logout)

routes.get('/hack', hack, login)

export default routes

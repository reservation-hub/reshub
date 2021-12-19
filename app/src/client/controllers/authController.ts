import {
  Router, CookieOptions, Request, Response, NextFunction,
} from 'express'
import { UnknownServerError } from '@routes/errors'
import passport from '@middlewares/passport'
import AuthService from '@client/services/AuthService'
import config from '../../config'

export type AuthServiceInterface = {
  createToken(user: Express.User): string
  verifyIfUserInTokenIsLoggedIn(authToken: any, headerToken?: string): Promise<void>
}

const login = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user } = req
    if (!user) {
      console.error('User is not found in request')
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
  } catch (e) { return next(e) }
}

export const verifyIfNotLoggedInYet = async (req: Request, res: Response, next: NextFunction)
  : Promise<Response | void> => {
  try {
    const { signedCookies } = req

    if (!signedCookies || !signedCookies.authToken) return next()
    let headerToken
    if (req.get('authorization')) {
      headerToken = req.get('authorization')?.split(' ')[1]
    }
    await AuthService.verifyIfUserInTokenIsLoggedIn(signedCookies.authToken, headerToken)
    return next()
  } catch (e) { return next(e) }
}

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('authToken')
  res.send('Logged out successfully!')
}

const routes = Router()

routes.post('/login', verifyIfNotLoggedInYet, passport.authenticate('client-local', { session: false }), login)
routes.post('/silent_refresh', passport.authenticate('client-jwt', { session: false }), login)
routes.get('/logout', passport.authenticate('client-jwt', { session: false }), logout)

export default routes

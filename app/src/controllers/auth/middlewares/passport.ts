import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JWTStrategy } from 'passport-jwt'
import { User } from '@entities/User'
import AuthService from '@auth/services/AuthService'
import UserService from '@auth/services/UserService'
import { localStrategySchema } from '@auth/schemas'
import config from '@config'

export type AuthServiceInterface = {
  authenticateByEmailAndPassword(email: string, password: string): Promise<User>
}

export type UserServiceInterface = {
  fetch(id: number): Promise<User>
}

// JWT

const cookieExtractor = (req: Request) => {
  let headerToken
  if (req.get('authorization')) {
    headerToken = req.get('authorization')?.split(' ')[1]
  }
  if (!headerToken) return null

  let authToken
  if (req.signedCookies) {
    authToken = req.signedCookies.authToken
  }
  if (!authToken) return null
  if (req && authToken && headerToken && authToken === headerToken) {
    return authToken
  }
  return null
}

const refreshCookieExtractor = (req: Request) => {
  let refreshToken
  if (req.signedCookies) {
    refreshToken = req.signedCookies.refreshToken
  }
  return refreshToken
}

const commonJwtOptions = {
  jwtFromRequest: cookieExtractor,
  audience: config.ADMIN_URL,
  secretOrKey: config.JWT_TOKEN_SECRET,
  issuer: config.RESHUB_URL,
}

const jwtOptionsRefresh = {
  ...commonJwtOptions,
  jwtFromRequest: refreshCookieExtractor,
  expiresIn: '30d',
}

const jwtOptionsAdmin = {
  ...commonJwtOptions,
  expiresIn: '1d',
}

const jwtStrategyLogic = async (jwtPayload: any, done: any) => {
  try {
    const user = await UserService.fetch(jwtPayload.user.id)
    return done(null, {
      id: user.id,
      role: user.role,
    })
  } catch (e) { return done(e) }
}

passport.use('admin-jwt', new JWTStrategy(jwtOptionsAdmin, jwtStrategyLogic))
passport.use('admin-refresh', new JWTStrategy(jwtOptionsRefresh, jwtStrategyLogic))
passport.use('admin-local', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  try {
    const {
      email, password: cleanPassword,
    } = await localStrategySchema.parseAsync({ email: username, password })
    const user = await AuthService.authenticateByEmailAndPassword(email, cleanPassword)
    return done(null, {
      id: user.id,
      role: user.role,
    })
  } catch (e) { return done(e) }
}))

export default passport

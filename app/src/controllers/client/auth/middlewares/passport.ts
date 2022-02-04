import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JWTStrategy } from 'passport-jwt'
import { User } from '@entities/User'
import UserService from '@client/auth/services/UserService'
import AuthService from '@client/auth/services/AuthService'
import { localStrategySchema } from '@client/auth/schemas'
import config from '@config'

export type AuthServiceInterface = {
  authenticateByUsernameAndPassword(username: string, password: string): Promise<User>
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
  secretOrKey: config.JWT_TOKEN_SECRET,
  issuer: config.RESHUB_URL,
  audience: config.CLIENT_URL,
}

const jwtOptionsRefresh = {
  ...commonJwtOptions,
  jwtFromRequest: refreshCookieExtractor,
  expiresIn: '30d',
}

const jwtOptionsClient = {
  ...commonJwtOptions,
  expiresIn: '30d',
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

passport.use('client-jwt', new JWTStrategy(jwtOptionsClient, jwtStrategyLogic))
passport.use('client-refresh', new JWTStrategy(jwtOptionsRefresh, jwtStrategyLogic))
// local

passport.use('client-local', new LocalStrategy(async (username, password, done) => {
  try {
    const {
      username: cleanUsername, password: cleanPassword,
    } = await localStrategySchema.parseAsync({ username, password })
    const user = await AuthService.authenticateByUsernameAndPassword(cleanUsername, cleanPassword)
    return done(null, {
      id: user.id,
      role: user.role,
    })
  } catch (e) { return done(e) }
}))

export default passport

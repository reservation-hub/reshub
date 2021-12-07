import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JWTStrategy } from 'passport-jwt'
import { localStrategySchema } from '@controllers/schemas/auth'
import { User } from '@entities/User'
import { localAuthenticationQuery } from '@request-response-types/AuthService'
import { localAuthenticationQuery as clientLocalAuthenticationQuery }
  from '@request-response-types/client/AuthService'
import AuthService from '@services/AuthService'
import UserService from '@services/UserService'
import ClientAuthService from '@client/services/AuthService'
import { localStrategySchema as apiLocalStrategySchema } from '@client/controllers/schemas/auth'

export type AuthServiceInterface = {
  authenticateByEmailAndPassword(query: localAuthenticationQuery): Promise<User>
}

export type APIAuthServiceInterface = {
  authenticateByUsernameAndPassword(query: clientLocalAuthenticationQuery): Promise<User>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

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
  secretOrKey: process.env.JWT_TOKEN_SECRET,
  issuer: process.env.RESHUB_URL,
}

const jwtOptionsRefresh = {
  ...commonJwtOptions,
  jwtFromRequest: refreshCookieExtractor,
  audience: 'http://localhost:8080',
  expiresIn: '30d',
}

const jwtOptionsAdmin = {
  ...commonJwtOptions,
  audience: 'http://localhost:8080',
  expiresIn: '1d',
}

const jwtOptionsClient = {
  ...commonJwtOptions,
  audience: 'http://localhost:3000',
  expiresIn: '30d',
}

const jwtStrategyLogic = async (jwtPayload: any, done: any) => {
  try {
    const user = await UserService.fetchUser(jwtPayload.user.id)
    return done(null, user)
  } catch (error) { return done(error) }
}

passport.use('admin-jwt', new JWTStrategy(jwtOptionsAdmin, jwtStrategyLogic))
passport.use('client-jwt', new JWTStrategy(jwtOptionsClient, jwtStrategyLogic))
passport.use('refresh-jwt', new JWTStrategy(jwtOptionsRefresh, jwtStrategyLogic))
// local

passport.use('client-local', new LocalStrategy(async (username, password, done) => {
  try {
    const schemaValues = await apiLocalStrategySchema.validateAsync({ username, password }, joiOptions)
    const user = await ClientAuthService.authenticateByUsernameAndPassword(schemaValues)
    return done(null, user)
  } catch (error) { return done(error) }
}))

passport.use('admin-local', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  try {
    const schemaValues = await localStrategySchema.validateAsync({ email: username, password }, joiOptions)
    const user = await AuthService.authenticateByEmailAndPassword(schemaValues)
    return done(null, user)
  } catch (error) { return done(error) }
}))

export default passport

import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JWTStrategy } from 'passport-jwt'
import AuthService, { localAuthenticationQuery } from '../../services/AuthService'
import UserService from '../../services/UserService'
import { User } from '../../entities/User'
import { localStrategySchema } from '../schemas/auth'

export type AuthServiceInterface = {
  authenticateByEmailAndPassword(query: localAuthenticationQuery): Promise<User>
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

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_TOKEN_SECRET,
  audience: 'http://localhost:8080',
  expiresIn: '1d',
  issuer: process.env.RESHUB_URL,
}

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await UserService.fetchUser(jwtPayload.user.id)
    return done(null, user)
  } catch (error) { return done(error) }
}))

// local

passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  try {
    const schemaValues = await localStrategySchema.validateAsync({ email: username, password }, joiOptions)
    const user = await AuthService.authenticateByEmailAndPassword(schemaValues)
    return done(null, user)
  } catch (error) { return done(error) }
}))

export default passport

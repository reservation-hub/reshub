import { Request } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JWTStrategy } from 'passport-jwt'
import AuthService from '../services/AuthService'
import UserService from '../services/UserService'
import { User } from '../entities/User'

export type AuthServiceInterface = {
  authenticateByEmailAndPassword(email: string, password: string): Promise<User>
}

// JWT

const cookieExtractor = (req: Request) => {
  let headerToken
  if (req.get('authorization')) {
    // eslint-disable-next-line prefer-destructuring
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
  } catch (error) { return done({ error }, null) }
}))

// local

passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  const user = await AuthService.authenticateByEmailAndPassword(username, password)
  return done(null, user)
}))

export default passport

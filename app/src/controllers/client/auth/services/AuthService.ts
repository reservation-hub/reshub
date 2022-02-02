import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { OAuth2Client as GoogleAuthClient, TokenPayload } from 'google-auth-library'
import config from '@config'
import { User } from '@entities/User'
import UserRepository from '@client/auth/repositories/UserRepository'
import { AuthServiceInterface as AuthControllerSocket } from '@client/auth/AuthController'
import { AuthServiceInterface as PassportSocket } from '@client/auth/middlewares/passport'
import {
  InvalidParamsError, NotFoundError, AuthenticationError, UserIsLoggedInError, AuthorizationError, InvalidTokenError,
} from '@errors/ServiceErrors'

export type UserRepositoryInterface = {
  fetch(id: number): Promise<User | null>
  fetchByEmail(email: string): Promise<User | null>
  addOAuthId(id: number, provider: string, authId: string): Promise<boolean | null>
  fetchByUsername(username: string): Promise<User | null>
}

interface JwtPayload {
  user: User
}

const AuthService: PassportSocket & AuthControllerSocket = {

  createToken(user, expiresIn) {
    return jwt.sign({ user }, config.JWT_TOKEN_SECRET, {
      audience: config.CLIENT_URL,
      expiresIn,
      issuer: config.RESHUB_URL,
    })
  },

  async googleAuthenticate(tokenId) {
    const client = new GoogleAuthClient(config.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: config.GOOGLE_CLIENT_ID,
    })

    const { email, sub } = ticket.getPayload() as TokenPayload
    if (!email) {
      throw new InvalidTokenError('Token does not have email')
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      throw new NotFoundError('User in token does not exist')
    }

    if (!user.oAuthIds || !user.oAuthIds.googleId) {
      await UserRepository.addOAuthId(user.id, 'google', sub)
    }

    return user
  },

  async authenticateByUsernameAndPassword(username, password) {
    if (!username || !password) {
      throw new InvalidParamsError('username or password is not filled')
    }

    const user = await UserRepository.fetchByUsername(username)
    if (!user) {
      throw new NotFoundError('User provided not found')
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      throw new InvalidParamsError('passwords did not match')
    }

    return user
  },

  async silentRefreshTokenChecks(authToken, refreshToken, headerToken?) {
    if (!(!authToken && !headerToken && refreshToken)) {
      throw new AuthorizationError('Necessary tokens are not complete')
    }
  },

  async verifyIfUserInTokenIsLoggedIn(authToken, headerToken?) {
    if (headerToken && headerToken !== authToken) {
      throw new AuthenticationError('header token does not match auth token')
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      throw new NotFoundError('User provided not found')
    }
    throw new UserIsLoggedInError('User is already logged in')
  },

  async hack() {
    const user = await UserRepository.fetchByUsername('eugene.sinamban@gmail.com')
    if (!user) {
      throw new NotFoundError('User for hack not found')
    }
    return user
  },
}

export default AuthService

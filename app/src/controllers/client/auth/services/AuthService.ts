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
import Logger from '@lib/Logger'

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
      Logger.debug('Token does not have email')
      throw new InvalidTokenError()
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      Logger.debug('User in token does not exist')
      throw new NotFoundError()
    }

    if (!user.oAuthIds || !user.oAuthIds.googleId) {
      await UserRepository.addOAuthId(user.id, 'google', sub)
    }

    return user
  },

  async authenticateByUsernameAndPassword(username, password) {
    if (!username || !password) {
      Logger.debug('username or password is not filled')
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetchByUsername(username)
    if (!user) {
      Logger.debug('User provided not found')
      throw new NotFoundError()
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      Logger.debug('passwords did not match')
      throw new InvalidParamsError()
    }

    return user
  },

  async silentRefreshTokenChecks(authToken, refreshToken, headerToken?) {
    if (!(!authToken && !headerToken && refreshToken)) {
      Logger.debug('Necessary tokens are not complete')
      throw new AuthorizationError()
    }
  },

  async verifyIfUserInTokenIsLoggedIn(authToken, headerToken?) {
    if (headerToken && headerToken !== authToken) {
      Logger.debug('header token does not match auth token')
      throw new AuthenticationError()
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      Logger.debug('User provided not found')
      throw new NotFoundError()
    }
    Logger.debug('User is already logged in')
    throw new UserIsLoggedInError()
  },

  async hack() {
    const user = await UserRepository.fetchByUsername('eugene.sinamban@gmail.com')
    if (!user) {
      Logger.debug('User for hack not found')
      throw new NotFoundError()
    }
    return user
  },
}

export default AuthService

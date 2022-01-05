import jwt from 'jsonwebtoken'
import { OAuth2Client as GoogleAuthClient, TokenPayload } from 'google-auth-library'
import bcrypt from 'bcrypt'

import config from '@config'
import { AuthServiceInterface as PassportSocket } from '@auth/middlewares/passport'
import { AuthServiceInterface as AuthControllerSocket } from '@auth/AuthController'
import { RoleSlug } from '@entities/Role'
import { User } from '@entities/User'
import UserRepository from '@auth/repositories/UserRepository'
import {
  AuthenticationError, AuthorizationError, InvalidParamsError, InvalidTokenError, NotFoundError, UserIsLoggedInError,
} from '@errors/ServiceErrors'
import Logger from '@lib/Logger'

export type UserRepositoryInterface = {
  fetch(id: number): Promise<User | null>
  fetchByEmail(email: string): Promise<User | null>
  addOAuthId(id: number, provider: string, authId: string): Promise<boolean | null>
}
interface JwtPayload {
  user: User
}

const AuthService: AuthControllerSocket & PassportSocket = {
  createToken(user, expiresIn) {
    return jwt.sign({ user }, config.JWT_TOKEN_SECRET, {
      audience: 'http://localhost:8080',
      expiresIn,
      issuer: process.env.RESHUB_URL,
    })
  },

  async verifyIfUserInTokenIsLoggedIn(authToken, headerToken?) {
    if (headerToken && headerToken !== authToken) {
      Logger.debug('Header token does not match')
      throw new AuthenticationError()
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      Logger.debug('User in token does not exist')
      throw new NotFoundError()
    }
    Logger.debug('User is already logged in')
    throw new UserIsLoggedInError()
  },

  async silentRefreshTokenChecks(authToken, refreshToken, headerToken?) {
    if (!(!authToken && !headerToken && refreshToken)) {
      Logger.debug('Necessary tokens are not complete')
      throw new AuthorizationError()
    }
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

  async authenticateByEmailAndPassword(email, password) {
    if (!email || !password) {
      Logger.debug('email or password is required')
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      Logger.debug('User does not exist')
      throw new NotFoundError()
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      Logger.debug('password does not match')
      throw new InvalidParamsError()
    }

    return user
  },

  async hack(role) {
    let user
    if (role === RoleSlug.SHOP_STAFF) {
      user = await UserRepository.fetchByEmail('staff1@staff.com')
    } else {
      user = await UserRepository.fetchByEmail('eugene.sinamban@gmail.com')
    }
    if (!user) {
      Logger.debug('User for hack not found')
      throw new NotFoundError()
    }
    return user
  },

}

export default AuthService

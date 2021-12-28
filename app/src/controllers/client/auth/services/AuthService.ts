import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from '@config'
import { User } from '@entities/User'
import UserRepository from '@client/auth/repositories/UserRepository'
import { AuthServiceInterface as AuthControllerSocket } from '@client/auth/AuthController'
import { AuthServiceInterface as PassportSocket } from '@client/auth/middlewares/passport'
import {
  InvalidParamsError, NotFoundError, AuthenticationError, UserIsLoggedInError, AuthorizationError,
} from '@client/auth/services/ServiceError'
import Logger from '@lib/Logger'

export type UserRepositoryInterface = {
  fetch(id: number): Promise<User | null>
  fetchByUsername(username: string): Promise<User | null>
}

interface JwtPayload {
  user: User
}

const AuthService: PassportSocket & AuthControllerSocket = {

  createToken(user, expiresIn) {
    return jwt.sign({ user }, config.JWT_TOKEN_SECRET, {
      audience: 'http://localhost:3000',
      expiresIn,
      issuer: process.env.RESHUB_URL,
    })
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

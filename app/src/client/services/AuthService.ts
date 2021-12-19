import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { AuthServiceInterface as AuthControllerSocket } from '@client/controllers/authController'
import { APIAuthServiceInterface } from '@middlewares/passport'
import { User } from '@entities/User'
import UserRepository from '@client/repositories/UserRepository'
import {
  InvalidParamsError, NotFoundError, AuthenticationError, UserIsLoggedInError,
} from '@services/Errors/ServiceError'
import config from '../../config'

export type UserRepositoryInterface = {
  fetch(id: number): Promise<User | null>
  fetchByUsername(username: string): Promise<User | null>
}

interface JwtPayload {
  user: User
}

const AuthService: APIAuthServiceInterface & AuthControllerSocket = {

  createToken(user) {
    return jwt.sign({ user }, config.JWT_TOKEN_SECRET, {
      audience: 'http://localhost:3000',
      expiresIn: '30d',
      issuer: process.env.RESHUB_URL,
    })
  },

  async authenticateByUsernameAndPassword({ username, password }) {
    if (!username || !password) {
      console.error('username or password is not filled')
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetchByUsername(username)
    if (!user) {
      console.error('User provided not found')
      throw new NotFoundError()
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      console.error('passwords did not match')
      throw new InvalidParamsError()
    }

    return user
  },

  async verifyIfUserInTokenIsLoggedIn(authToken, headerToken?) {
    if (headerToken && headerToken !== authToken) {
      console.error('header token does not match auth token')
      throw new AuthenticationError()
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      console.error('User provided not found')
      throw new NotFoundError()
    }
    console.error('User is already logged in')
    throw new UserIsLoggedInError()
  },
}

export default AuthService

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { AuthServiceInterface as AuthControllerSocket } from '@controllers/authController'
import config from '../../config'
import { APIAuthServiceInterface } from '../@middlewares/passport'
import {
  InvalidParamsError, NotFoundError, AuthenticationError, UserIsLoggedInError,
} from '../../services/Errors/ServiceError'
import { User } from '../@entities/User'
import UserRepository from '../repositories/UserRepository'

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
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetchByUsername(username)
    if (!user) {
      throw new NotFoundError()
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      throw new InvalidParamsError()
    }

    delete user.password

    return user
  },

  async verifyIfUserInTokenIsLoggedIn(authToken, headerToken?) {
    if (headerToken && headerToken !== authToken) {
      throw new AuthenticationError()
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      throw new NotFoundError()
    }
    throw new UserIsLoggedInError()
  },
}

export default AuthService

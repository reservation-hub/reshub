import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import config from '../../../config'
import { APIAuthServiceInterface } from '../../controllers/utils/passport'
import { InvalidParamsError, NotFoundError } from '../../services/Errors/ServiceError'
import { AuthServiceInterface as AuthControllerSocket } from '../controllers/authController'
import { User } from '../../entities/User'
import UserRepository from '../repositories/UserRepository'

export type UserRepositoryInterface = {
  fetchByUsername(username: string): Promise<User | null>
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

}

export default AuthService

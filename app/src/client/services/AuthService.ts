import jwt from 'jsonwebtoken'
import config from '../../../config'
import { APIAuthServiceInterface } from '../../controllers/utils/passport'
import { InvalidParamsError } from '../../services/Errors/ServiceError'
import { AuthServiceInterface as AuthControllerSocket } from '../controllers/authController'

const AuthService: APIAuthServiceInterface & AuthControllerSocket = {
  createToken(user) {
    return jwt.sign({ user }, config.JWT_TOKEN_SECRET, {
      audience: 'http://localhost:3000',
      expiresIn: '30d',
      issuer: process.env.RESHUB_URL,
    })
  },
  async authenticateByUsernameAndPassword(query) {
    const dummyUser = {
      id: 1,
      username: 'eugenesinamban',
      email: 'eugene.sinamban@gmail.com',
      password: 'testtest',
      roles: [{
        name: 'admin', id: 1, description: '', slug: 'admin',
      }],
    }
    if (query.password !== dummyUser.password) {
      throw new InvalidParamsError()
    }
    return dummyUser
  },
}

export default AuthService

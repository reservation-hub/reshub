import jwt from 'jsonwebtoken'
import { OAuth2Client as GoogleAuthClient, TokenPayload } from 'google-auth-library'
import bcrypt from 'bcrypt'

import { AuthServiceInterface as PassportSocket } from '@middlewares/passport'
import { AuthServiceInterface as AuthControllerSocket } from '@controllers/authController'
import { User } from '@entities/User'
import UserRepository from '@repositories/UserRepository'
import config from '../config'
import {
  InvalidParamsError, InvalidTokenError, NotFoundError, UserIsLoggedInError, AuthenticationError, AuthorizationError,
} from './Errors/ServiceError'

export type UserRepositoryInterface = {
  fetchByEmail(email: string): Promise<User | null>,
  addOAuthId(id: number, provider: string, authId: string): Promise<boolean | null>,
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
      throw new AuthenticationError()
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      throw new NotFoundError()
    }
    throw new UserIsLoggedInError()
  },

  async silentRefreshTokenChecks(authToken, refreshToken, headerToken?) {
    if (!(!authToken && !headerToken && refreshToken)) {
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
      throw new InvalidTokenError()
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      throw new NotFoundError()
    }

    delete user.password

    if (!user.oAuthIds || !user.oAuthIds.googleId) {
      await UserRepository.addOAuthId(user.id, 'google', sub)
    }

    return user
  },

  async authenticateByEmailAndPassword({ email, password }) {
    if (!email || !password) {
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      throw new NotFoundError()
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      throw new InvalidParamsError()
    }

    delete user.password

    return user
  },

  async hack(role) {
    let user
    if (role === 'staff') {
      user = await UserRepository.fetchByEmail('staff@staff.com')
    } else {
      user = await UserRepository.fetchByEmail('eugene.sinamban@gmail.com')
    }
    if (!user) {
      throw new NotFoundError()
    }
    delete user.password
    return user
  },

}

export default AuthService

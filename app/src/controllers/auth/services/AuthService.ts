import jwt from 'jsonwebtoken'
import { OAuth2Client as GoogleAuthClient, TokenPayload } from 'google-auth-library'
import bcrypt from 'bcrypt'

import config from '@config'
import { AuthServiceInterface as PassportSocket } from '@auth/middlewares/passport'
import { AuthServiceInterface as AuthControllerSocket } from '@auth/AuthController'
import { RoleSlug } from '@entities/Role'
import { User } from '@entities/User'
import UserRepository from '@auth/repositories/UserRepository'
import * as AuthError from '@auth/services/ServiceError'

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
      console.error('Header token does not match')
      throw new AuthError.AuthenticationError()
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      console.error('User in token does not exist')
      throw new AuthError.NotFoundError()
    }
    console.error('User is already logged in')
    throw new AuthError.UserIsLoggedInError()
  },

  async silentRefreshTokenChecks(authToken, refreshToken, headerToken?) {
    if (!(!authToken && !headerToken && refreshToken)) {
      console.error('Necessary tokens are not complete')
      throw new AuthError.AuthorizationError()
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
      console.error('Token does not have email')
      throw new AuthError.InvalidTokenError()
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      console.error('User in token does not exist')
      throw new AuthError.NotFoundError()
    }

    if (!user.oAuthIds || !user.oAuthIds.googleId) {
      await UserRepository.addOAuthId(user.id, 'google', sub)
    }

    return user
  },

  async authenticateByEmailAndPassword(email, password) {
    if (!email || !password) {
      console.error('email or password is required')
      throw new AuthError.InvalidParamsError()
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      console.error('User does not exist')
      throw new AuthError.NotFoundError()
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      console.error('password does not match')
      throw new AuthError.InvalidParamsError()
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
      console.error('User for hack not found')
      throw new AuthError.NotFoundError()
    }
    return user
  },

}

export default AuthService

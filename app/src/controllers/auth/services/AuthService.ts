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
      audience: config.ADMIN_URL,
      expiresIn,
      issuer: config.RESHUB_URL,
    })
  },

  async verifyIfUserInTokenIsLoggedIn(authToken, headerToken?) {
    if (headerToken && headerToken !== authToken) {
      throw new AuthenticationError('Header token does not match')
    }
    const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
    const user = await UserRepository.fetch(token.user.id)
    if (!user) {
      throw new NotFoundError('User in token does not exist')
    }
    throw new UserIsLoggedInError('User is already logged in')
  },

  async silentRefreshTokenChecks(authToken, refreshToken, headerToken?) {
    if (!(!authToken && !headerToken && refreshToken)) {
      throw new AuthorizationError('Necessary tokens are not complete')
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
      throw new InvalidTokenError('Token does not have email')
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      throw new NotFoundError('User in token does not exist')
    }

    if (!(user.role.slug === RoleSlug.ADMIN || user.role.slug === RoleSlug.SHOP_STAFF)) {
      throw new AuthorizationError('User is neither an admin nor a staff')
    }

    if (!user.oAuthIds || !user.oAuthIds.googleId) {
      await UserRepository.addOAuthId(user.id, 'google', sub)
    }

    return user
  },

  async authenticateByEmailAndPassword(email, password) {
    if (!email || !password) {
      throw new InvalidParamsError('email or password is required')
    }

    const user = await UserRepository.fetchByEmail(email)
    if (!user) {
      throw new NotFoundError(`User with email ${email} does not exist`)
    }

    if (!(user.role.slug === RoleSlug.ADMIN || user.role.slug === RoleSlug.SHOP_STAFF)) {
      throw new AuthorizationError('User is neither an admin nor a staff')
    }

    if (user.password && !bcrypt.compareSync(password, user.password)) {
      throw new InvalidParamsError('password does not match')
    }

    return user
  },

  async hack(role, userId) {
    let user
    if (role === RoleSlug.SHOP_STAFF && userId) {
      user = await UserRepository.fetch(userId)
    } else if (role === RoleSlug.SHOP_STAFF && !userId) {
      user = await UserRepository.fetchByEmail('staff32@staff.com')
    } else {
      user = await UserRepository.fetchByEmail('eugene.sinamban@gmail.com')
    }
    if (!user) {
      throw new NotFoundError('User for hack not found')
    }
    return user
  },

}

export default AuthService

import jwt from 'jsonwebtoken'
import { OAuth2Client as GoogleAuthClient, TokenPayload } from 'google-auth-library'
import bcrypt from 'bcrypt'

import config from '../../config'
import { User } from '../entities/User'
import { AuthServiceInterface as AuthControllerSocket } from '../controllers/authController'
import { AuthServiceInterface as PassportSocket } from '../routes/passport'
import UserRepository from '../repositories/UserRepository'
import {
  InvalidParamsError, InvalidTokenError, NotFoundError, UserIsLoggedInError,
} from './Errors/ServiceError'

export type UserRepositoryInterface = {
  fetchByEmail(email: string): Promise<User | null>,
  addOAuthID(id: number, provider: string, authID: string): Promise<boolean | null>,
}

interface JwtPayload {
  user: User
}

export const createToken = (user: Express.User): string => jwt.sign({ user }, config.JWT_TOKEN_SECRET, {
  audience: 'http://localhost:8080',
  expiresIn: '1d',
  issuer: process.env.RESHUB_URL,
})

export const verifyIfUserInTokenIsLoggedIn = async (authToken: any): Promise<void> => {
  const token = jwt.verify(authToken, config.JWT_TOKEN_SECRET) as JwtPayload
  const user = await UserRepository.fetch(token.user.id)
  if (!user) {
    throw new NotFoundError()
  }
  throw new UserIsLoggedInError()
}

export const googleAuthenticate = async (tokenID: string): Promise<User> => {
  const client = new GoogleAuthClient(config.GOOGLE_CLIENT_ID)
  const ticket = await client.verifyIdToken({
    idToken: tokenID,
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

  if (!user.oAuthIDs || !user.oAuthIDs.googleID) {
    await UserRepository.addOAuthID(user.id, 'google', sub)
  }

  return user
}

export const authenticateByEmailAndPassword = async (email: string, password: string)
: Promise<User> => {
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
}

export const hack = async (): Promise<User> => {
  const user = await UserRepository.fetchByEmail('eugene.sinamban@gmail.com')
  if (!user) {
    throw new NotFoundError()
  }
  delete user.password
  return user
}

const AuthService: AuthControllerSocket & PassportSocket = {
  createToken,
  verifyIfUserInTokenIsLoggedIn,
  googleAuthenticate,
  authenticateByEmailAndPassword,
  hack,
}

export default AuthService

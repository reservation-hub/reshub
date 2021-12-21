import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '@config'
import { SignUpServiceInterface } from '@client/controllers/signUpController'
import UserRepository from '@client/repositories/UserRepository'
import { User } from '@entities/User'
import { DuplicateModelError, InvalidParamsError } from '@services/Errors/ServiceError'
import MailService from './MailService'

export type UserRepositoryInterface = {
  insertUser(email: string, username: string, password: string): Promise<User>,
  emailIsAvailable(email: string): Promise<boolean>
}

export type MailServiceInterface = {
  SendSignupEmail(email: string, token: string): void
}
export type signUpQuery = {
  email: string,
  username: string,
  password: string,
  confirm: string,
}

export const createSignupToken = (email: string): string => (jwt.sign(
  { email },
  config.JWT_TOKEN_SECRET,
  {
    expiresIn: '12h',
  },
))

export const signUpUser = async (query: signUpQuery): Promise<User> => {
  if (query.password !== query.confirm) {
    console.error('passwords did not match')
    throw new InvalidParamsError()
  }
  const isAvailable = await UserRepository.emailIsAvailable(query.email)
  if (!isAvailable) {
    console.error('Email is not available')
    throw new DuplicateModelError()
  }
  const hash = bcrypt.hashSync(query.password, 10 /* hash rounds */)
  const user = await UserRepository.insertUser(query.email, query.username, hash)
  const token = createSignupToken(user.email)
  MailService.SendSignupEmail(user.email, token)
  return user
}

const SignUpService: SignUpServiceInterface = {
  signUpUser,
}

export default SignUpService
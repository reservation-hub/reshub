import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../../entities/User'
import { SignUpServiceInterface } from '../controllers/signUpController'
import { DuplicateModelError, InvalidParamsError } from '../../services/Errors/ServiceError'
import UserRepository from '../repositories/UserRepository'
import config from '../../../config'
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

export const createSignupToken = (email: string) => (jwt.sign(
  { email },
  config.JWT_TOKEN_SECRET,
  {
    expiresIn: '12h',
  },
))

export const signUpUser = async (query: signUpQuery): Promise<User> => {
  if (query.password !== query.confirm) {
    throw new InvalidParamsError()
  }
  const isAvailable = await UserRepository.emailIsAvailable(query.email)
  if (!isAvailable) throw new DuplicateModelError()
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

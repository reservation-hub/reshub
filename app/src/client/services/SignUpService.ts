import bcrypt from 'bcrypt'
import { User } from '../../entities/User'
import { SignUpServiceInterface } from '../controllers/signupController'
import { InvalidParamsError } from '../../services/Errors/ServiceError'
import UserRepository from '../repositories/UserRepository'

export type UserRepositoryInterface = {
  insertUser(email: string, username: string, password: string): Promise<User>
}

export type signUpQuery = {
  email: string,
  username: string,
  password: string,
  confirm: string,
}

export const signUpUser = async (query: signUpQuery): Promise<User> => {
  if (query.password !== query.confirm) {
    throw new InvalidParamsError()
  }
  const hash = bcrypt.hashSync(query.password, 10 /* hash rounds */)
  return UserRepository.insertUser(query.email, query.username, hash)
}

const SignUpService: SignUpServiceInterface = {
  signUpUser,
}

export default SignUpService

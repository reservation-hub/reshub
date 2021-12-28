import bcrypt from 'bcrypt'
import { User } from '@entities/User'
import UserRepository from '@client/user/repositories/UserRepository'
import { DuplicateModelError, InvalidParamsError } from '@client/user/services/ServiceError'
import { SignUpServiceInterface } from '@client/user/UserController'
import Logger from '@lib/Logger'

export type UserRepositoryInterface = {
  insertUser(email: string, username: string, password: string): Promise<User>
  emailIsAvailable(email: string): Promise<boolean>
}

const SignUpService: SignUpServiceInterface = {
  async signUpUser(email, username, password, confirm) {
    if (password !== confirm) {
      Logger.debug('passwords did not match')
      throw new InvalidParamsError()
    }

    const isAvailable = await UserRepository.emailIsAvailable(email)
    if (!isAvailable) {
      Logger.debug('Email is not available')
      throw new DuplicateModelError()
    }
    const hash = bcrypt.hashSync(password, 10 /* hash rounds */)
    return UserRepository.insertUser(email, username, hash)
  },
}

export default SignUpService

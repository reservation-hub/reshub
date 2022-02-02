import bcrypt from 'bcrypt'
import { Gender, User } from '@entities/User'
import UserRepository from '@client/user/repositories/UserRepository'
import { DuplicateModelError, InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import { UserServiceInterface } from '@client/user/UserController'

export type UserRepositoryInterface = {
  fetchUser(id: number): Promise<User | null>
  insertUser(email: string, username: string, password: string): Promise<User>
  emailAndUsernameAreAvailable(email: string, username: string): Promise<boolean>
  updateUser(id: number, lastNameKanji: string, firstNameKanji: string, lastNameKana: string, firstNameKana: string,
    gender: Gender, birthday: Date): Promise<User>
    updateUserPassword(id: number, password: string): Promise<User>
}

const UserService: UserServiceInterface = {
  async signUpUser(email, username, password, confirm) {
    if (password !== confirm) {
      throw new InvalidParamsError('passwords did not match')
    }

    const emailAndUsernameAreAvailable = await UserRepository.emailAndUsernameAreAvailable(email, username)
    if (!emailAndUsernameAreAvailable) {
      throw new DuplicateModelError('Email / Username is not available')
    }
    const hash = bcrypt.hashSync(password, 10 /* hash rounds */)
    return UserRepository.insertUser(email, username, hash)
  },

  async updateUser(id, lastNameKanji, firstNameKanji, lastNameKana, firstNameKana,
    gender, birthday) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }

    return UserRepository.updateUser(
      id, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday,
    )
  },

  async updateUserPassword(id, oldPassword, newPassword, confirmNewPassword) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.password)
    if (!passwordMatches) {
      throw new InvalidParamsError('Old password do not match')
    }

    if (newPassword !== confirmNewPassword) {
      throw new InvalidParamsError('Passwords do not match')
    }

    const hash = bcrypt.hashSync(newPassword, 10 /* hash rounds */)

    return UserRepository.updateUserPassword(id, hash)
  },
}

export default UserService

import { UserControllerInterface } from '@controller-adapter/client/User'
import UserService from '@client/user/services/UserService'
import { Gender, User } from '@entities/User'
import { signUpSchema, updateUserSchema, userPasswordUpdateSchema } from '@client/user/schemas'
import MailService from '@client/user/services/MailService'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { convertDateStringToDateObject } from '@lib/Date'

export type UserServiceInterface = {
  signUpUser(email: string, username: string, password: string, confirm: string): Promise<User>
  updateUser(id: number, lastNameKanji: string, firstNameKanji: string, lastNameKana: string,
    firstNameKana: string, gender: Gender, birthday: Date): Promise<User>
  updateUserPassword(id: number, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<User>
}

export type MailServiceInterface = {
  sendSignUpEmail(email: string): Promise<void>
}

const UserController: UserControllerInterface = {
  async signUp(query) {
    const {
      email, username, password, confirm,
    } = await signUpSchema.parseAsync(query)
    await UserService.signUpUser(email, username, password, confirm)
    await MailService.sendSignUpEmail(email)
    return 'User created'
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }

    const {
      lastNameKanji, firstNameKanji, lastNameKana, firstNameKana, gender, birthday,
    } = await updateUserSchema.parseAsync(query)
    const dateObject = convertDateStringToDateObject(birthday)
    await UserService.updateUser(user.id, lastNameKanji, firstNameKanji, lastNameKana, firstNameKana,
      gender, dateObject)

    return 'User updated'
  },

  async updatePassword(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }

    const {
      oldPassword, newPassword, confirmNewPassword,
    } = await userPasswordUpdateSchema.parseAsync(query)
    await UserService.updateUserPassword(user.id, oldPassword, newPassword, confirmNewPassword)

    return 'Password updated'
  },
}

export default UserController

import { UserControllerInterface } from '@controller-adapter/client/User'
import UserService from '@client/user/services/UserService'
import { User } from '@entities/User'
import { signUpSchema } from '@client/user/schemas'
import MailService from '@client/user/services/MailService'

const joiOptions = { abortEarly: false, stripUnknown: true }

export type SignUpServiceInterface = {
  signUpUser(email: string, username: string, password: string, confirm: string): Promise<User>
}

export type MailServiceInterface = {
  sendSignUpEmail(email: string): Promise<void>
}

const UserController: UserControllerInterface = {
  async signUp(query) {
    const {
      email, username, password, confirm,
    } = await signUpSchema.validateAsync(query, joiOptions)
    await UserService.signUpUser(email, username, password, confirm)
    await MailService.sendSignUpEmail(email)
    return 'User created'
  },
}

export default UserController

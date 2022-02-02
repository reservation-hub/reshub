import { User } from '@entities/User'
import { UserServiceInterface } from '@client/auth/middlewares/passport'
import UserRepository from '@client/auth/repositories/UserRepository'
import { NotFoundError } from '@errors/ServiceErrors'

export type UserRepositoryInterface = {
  fetch(id: number): Promise<User | null>
}

const UserService: UserServiceInterface = {
  async fetch(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return user
  },
}

export default UserService

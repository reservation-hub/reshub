import { User } from '@entities/User'
import { UserServiceInterface } from '@client/auth/middlewares/passport'
import UserRepository from '@client/auth/repositories/UserRepository'
import { NotFoundError } from '@client/auth/services/ServiceError'

export type UserRepositoryInterface = {
  fetch(id: number): Promise<User | null>
}

const UserService: UserServiceInterface = {
  async fetch(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      console.error('User not found')
      throw new NotFoundError()
    }
    return user
  },
}

export default UserService

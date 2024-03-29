import { UserServiceInterface } from '@auth/middlewares/passport'
import { Gender, User } from '@entities/User'
import UserRepository from '@auth/repositories/UserRepository'
import { RoleSlug } from '@entities/Role'
import { NotFoundError } from '@errors/ServiceErrors'

export type UserRepositoryInterface = {
  insertUserWithProfile(email: string, password: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: string, gender: Gender,)
    : Promise<User>
  updateUserFromAdmin(id: number, email: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: string, gender: Gender)
    : Promise<User>
  deleteUserFromAdmin(id: number): Promise<User>
  searchUser(keyword: string): Promise<User[]>
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

export type RoleRepositoryInterface = {
  isValidRole(slug: RoleSlug): Promise<boolean>
  extractValidRoleSlugs(roleSlugs: RoleSlug[]): Promise<RoleSlug[]>
}

export type ReservationRepositoryInterface = {
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserService: UserServiceInterface = {

  async fetch(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }
    return user
  },
}

export default UserService

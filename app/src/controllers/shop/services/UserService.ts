import { UserServiceInterface } from '@shop/ShopController'
import { User } from '@entities/User'
import UserRepository from '@shop/repositories/UserRepository'
import { RoleSlug } from '@entities/Role'

export type UserRepositoryInterface = {
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

export type RoleRepositoryInterface = {
  isValidRole(slug: RoleSlug): Promise<boolean>,
  extractValidRoleSlugs(roleSlugs: RoleSlug[]): Promise<RoleSlug[]>
}

export type ReservationRepositoryInterface = {
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserService: UserServiceInterface = {
  async fetchUsersByIds(userIds) {
    return UserRepository.fetchUsersByIds(userIds)
  },
}

export default UserService

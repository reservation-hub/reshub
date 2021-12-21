import { UserServiceInterface } from '@dashboard/DashboardController'
import { User } from '@entities/User'
import UserRepository from '@dashboard/repositories/UserRepository'
import ReservationRepository from '@dashboard/repositories/ReservationRepository'

export type UserRepositoryInterface = {
  fetchUsers(): Promise<User[]>
  fetchUsersByIds(userIds: number[]): Promise<User[]>
  totalCount(): Promise<number>
}

export type ReservationRepositoryInterface = {
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserService: UserServiceInterface = {
  async fetchUsersWithReservationCounts() {
    const users = await UserRepository.fetchUsers()
    const userReservationCounts = await ReservationRepository.fetchUsersReservationCounts(users.map(u => u.id))
    const totalCount = await UserRepository.totalCount()
    return {
      users: users.map(u => ({
        ...u,
        reservationCount: userReservationCounts.find(urc => urc.userId === u.id)!.reservationCount,
      })),
      totalCount,
    }
  },

  async fetchUsersByIds(userIds) {
    return UserRepository.fetchUsersByIds(userIds)
  },
}

export default UserService

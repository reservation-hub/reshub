import bcrypt from 'bcrypt'
import { Gender, User } from '@entities/User'
import { RoleSlug } from '@entities/Role'
import { UserServiceInterface } from '@user/UserController'
import UserRepository from '@user/repositories/UserRepository'
import ReservationRepository from '@user/repositories/ReservationRepository'
import { InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import { OrderBy } from '@entities/Common'

export type UserRepositoryInterface = {
  fetchAllUsers(page: number, order: OrderBy, take: number): Promise<User[]>
  fetchUser(userId: number): Promise<User | null>
  totalCount(): Promise<number>
  insertUser(email: string, password: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: Date, gender: Gender,)
    : Promise<User>
  updateUser(id: number, email: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: Date, gender: Gender)
    : Promise<User>
  updateUserPassword(id: number, password: string): Promise<User>
  deleteUser(id: number): Promise<User>
  searchUser(keyword: string, page: number, order: OrderBy, take: number): Promise<User[]>
  searchUserTotalCount(keyword: string): Promise<number>
  fetchUserByEmail(email: string): Promise<User | null>
}

export type ReservationRepositoryInterface = {
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserService: UserServiceInterface = {

  async fetchUsersWithTotalCount(page = 1, order = OrderBy.DESC, take = 10) {
    const users = await UserRepository.fetchAllUsers(page, order, take)
    const totalCount = await UserRepository.totalCount()
    return { users, totalCount }
  },

  async searchUser(keyword, page = 1, order = OrderBy.DESC, take = 10) {
    const users = await UserRepository.searchUser(keyword, page, order, take)
    const totalCount = await UserRepository.searchUserTotalCount(keyword)
    return { users, totalCount }
  },

  async fetchUser(id) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }
    return user
  },

  async insertUser(password, confirm, email, roleSlug, lastNameKanji,
    firstNameKanji, lastNameKana, firstNameKana, gender, birthday) {
    if (password !== confirm) {
      throw new InvalidParamsError('Passwords do not match')
    }

    const duplicate = await UserRepository.fetchUserByEmail(email)
    if (duplicate) {
      throw new InvalidParamsError('Email is not available')
    }

    const hash = bcrypt.hashSync(password, 10 /* hash rounds */)

    return UserRepository.insertUser(
      email, hash, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )
  },

  async updateUser(id, email, roleSlug, lastNameKanji, firstNameKanji,
    lastNameKana, firstNameKana, gender, birthday) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }

    return UserRepository.updateUser(
      id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
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

  async deleteUser(id) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      throw new NotFoundError(`User ${id} does not exist`)
    }
    return UserRepository.deleteUser(id)
  },

  async fetchUsersReservationCounts(userIds) {
    return ReservationRepository.fetchUsersReservationCounts(userIds)
  },
}

export default UserService

import bcrypt from 'bcrypt'
import { Gender, User } from '@entities/User'
import { RoleSlug } from '@entities/Role'
import { UserServiceInterface } from '@user/UserController'
import UserRepository from '@user/repositories/UserRepository'
import ReservationRepository from '@user/repositories/ReservationRepository'
import { InvalidParamsError, NotFoundError } from '@errors/ServiceErrors'
import Logger from '@lib/Logger'
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
      Logger.debug('User does not exist')
      throw new NotFoundError()
    }
    return user
  },

  async insertUser(password, confirm, email, roleSlug, lastNameKanji,
    firstNameKanji, lastNameKana, firstNameKana, gender, birthday) {
    if (password !== confirm) {
      Logger.debug('Passwords do not match')
      throw new InvalidParamsError()
    }

    const duplicate = await UserRepository.fetchUserByEmail(email)
    if (duplicate) {
      Logger.debug('Email is not available')
      throw new InvalidParamsError()
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
      Logger.debug('User does not exist')
      throw new NotFoundError()
    }

    return UserRepository.updateUser(
      id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )
  },

  async updateUserPassword(id, oldPassword, newPassword, confirmNewPassword) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      Logger.debug('User does not exist')
      throw new NotFoundError()
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.password)
    if (!passwordMatches) {
      Logger.debug('Old password do not match')
      throw new InvalidParamsError()
    }

    if (newPassword !== confirmNewPassword) {
      Logger.debug('Passwords do not match')
      throw new InvalidParamsError()
    }

    const hash = bcrypt.hashSync(newPassword, 10 /* hash rounds */)

    return UserRepository.updateUserPassword(id, hash)
  },

  async deleteUser(id) {
    const user = await UserRepository.fetchUser(id)
    if (!user) {
      Logger.debug('User does not exist')
      throw new NotFoundError()
    }
    return UserRepository.deleteUser(id)
  },

  async fetchUsersReservationCounts(userIds) {
    return ReservationRepository.fetchUsersReservationCounts(userIds)
  },
}

export default UserService

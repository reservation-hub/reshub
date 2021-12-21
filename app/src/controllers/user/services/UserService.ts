import bcrypt from 'bcrypt'
import { Gender, User } from '@entities/User'
import { RoleSlug } from '@entities/Role'
import { UserServiceInterface } from '@user/UserController'
import UserRepository from '@user/repositories/UserRepository'
import ReservationRepository from '@user/repositories/ReservationRepository'
import { InvalidParamsError, NotFoundError } from '@user/services/ServiceError'
import { OrderBy } from '@/entities/Common'

export type UserRepositoryInterface = {
  fetchAll(page: number, order: OrderBy): Promise<User[]>
  fetch(userId: number): Promise<User | null>
  totalCount(): Promise<number>
  insertUser(email: string, password: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: string, gender: Gender,)
    : Promise<User>,
  updateUser(id: number, email: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: string, gender: Gender)
    : Promise<User>,
  deleteUser(id: number): Promise<User>,
  searchUser(keyword: string): Promise<User[]>,
  fetchUserByEmail(email: string): Promise<User | null>
}

export type ReservationRepositoryInterface = {
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserService: UserServiceInterface = {

  async fetchUsersWithTotalCount(page = 1, order = OrderBy.DESC) {
    const users = await UserRepository.fetchAll(page, order)
    const totalCount = await UserRepository.totalCount()
    return { users, totalCount }
  },

  async searchUser(keyword) {
    const users = await UserRepository.searchUser(keyword)
    return users
  },

  async fetchUser(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      console.error('User does not exist')
      throw new NotFoundError()
    }
    return user
  },

  async insertUser(password, confirm, email, roleSlug, lastNameKanji,
    firstNameKanji, lastNameKana, firstNameKana, gender, birthday) {
    if (password !== confirm) {
      console.error('Passwords do not match')
      throw new InvalidParamsError()
    }

    const duplicate = await UserRepository.fetchUserByEmail(email)
    if (duplicate) {
      console.error('Email is not available')
      throw new InvalidParamsError()
    }

    const hash = bcrypt.hashSync(password, 10 /* hash rounds */)

    await UserRepository.insertUser(
      email, hash, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )
  },

  async updateUser(id, email, roleSlug, lastNameKanji, firstNameKanji,
    lastNameKana, firstNameKana, gender, birthday) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      console.error('User does not exist')
      throw new NotFoundError()
    }

    await UserRepository.updateUser(
      id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )
  },

  async deleteUser(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      console.error('User does not exist')
      throw new NotFoundError()
    }
    await UserRepository.deleteUser(id)
  },

  async fetchUsersReservationCounts(userIds) {
    return ReservationRepository.fetchUsersReservationCounts(userIds)
  },
}

export default UserService

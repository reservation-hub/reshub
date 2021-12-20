import bcrypt from 'bcrypt'
import { UserServiceInterface as UserControllerSocket } from '@controllers/user/UserController'
import { UserServiceInterface as DashboardControllerSocket } from '@controllers/dashboard/DashboardController'
import { UserServiceInterface as ShopControllerSocket } from '@controllers/shop/ShopController'
import { Gender, User } from '@entities/User'
import UserRepository from '@repositories/UserRepository'
import RoleRepository from '@repositories/RoleRepository'
import ReservationRepository from '@repositories/ReservationRepository'
import { RoleSlug } from '@entities/Role'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type UserRepositoryInterface = {
  insertUserWithProfile(email: string, password: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: string, gender: Gender,)
    : Promise<User>,
  updateUserFromAdmin(id: number, email: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, birthday: string, gender: Gender)
    : Promise<User>,
  deleteUserFromAdmin(id: number): Promise<User>,
  searchUser(keyword: string): Promise<User[]>,
  fetchUsersByIds(userIds: number[]): Promise<User[]>
}

export type RoleRepositoryInterface = {
  isValidRole(slug: RoleSlug): Promise<boolean>,
  extractValidRoleSlugs(roleSlugs: RoleSlug[]): Promise<RoleSlug[]>
}

export type ReservationRepositoryInterface = {
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserService: UserControllerSocket & DashboardControllerSocket & ShopControllerSocket = {
  async fetchUsersForDashboard() {
    const users = await UserRepository.fetchAll({ limit: 5 })
    const totalCount = await UserRepository.totalCount()
    return { users, totalCount }
  },

  async fetchUsersWithTotalCount(params) {
    const users = await UserRepository.fetchAll(params)
    const usersCount = await UserRepository.totalCount()
    return { values: users, totalCount: usersCount }
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

  async fetchUsersByIds(userIds) {
    return UserRepository.fetchUsersByIds(userIds)
  },

  async insertUserFromAdmin(password, confirm, email, roleSlug, lastNameKanji,
    firstNameKanji, lastNameKana, firstNameKana, gender, birthday) {
    if (password !== confirm) {
      console.error('Passwords do not match')
      throw new InvalidParamsError()
    }

    const isValidRole = await RoleRepository.isValidRole(roleSlug)
    if (!isValidRole) {
      console.error('Invalid Role passed')
      throw new InvalidParamsError()
    }

    const duplicate = await UserRepository.fetchByEmail(email)
    if (duplicate) {
      console.error('Email is not available')
      throw new InvalidParamsError()
    }

    const hash = bcrypt.hashSync(password, 10 /* hash rounds */)

    await UserRepository.insertUserWithProfile(
      email, hash, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )
  },

  async updateUserFromAdmin(id, email, roleSlug, lastNameKanji, firstNameKanji,
    lastNameKana, firstNameKana, gender, birthday) {
    const isValidRole = await RoleRepository.isValidRole(roleSlug)
    if (!isValidRole) {
      console.error('Invalid Role passed')
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetch(id)
    if (!user) {
      console.error('User does not exist')
      throw new NotFoundError()
    }

    await UserRepository.updateUserFromAdmin(
      id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )
  },

  async deleteUserFromAdmin(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      console.error('User does not exist')
      throw new NotFoundError()
    }
    await UserRepository.deleteUserFromAdmin(id)
  },

  async fetchUsersReservationCounts(userIds) {
    return ReservationRepository.fetchUsersReservationCounts(userIds)
  },
}

export default UserService

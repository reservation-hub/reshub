import bcrypt from 'bcrypt'
import { UserServiceInterface as UserControllerSocket } from '@controllers/userController'
import { UserServiceInterface as DashboardControllerSocket } from '@controllers/dashboardController'
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
}

export type RoleRepositoryInterface = {
  isValidRole(slug: RoleSlug): Promise<boolean>,
  extractValidRoleSlugs(roleSlugs: RoleSlug[]): Promise<RoleSlug[]>
}

export type ReservationRepositoryInterface = {
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserService: UserControllerSocket & DashboardControllerSocket = {
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

    const user = await UserRepository.insertUserWithProfile(
      email, hash, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )

    return user
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

    const updatedUser = await UserRepository.updateUserFromAdmin(
      id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, birthday, gender,
    )

    return updatedUser
  },

  async deleteUserFromAdmin(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      console.error('User does not exist')
      throw new NotFoundError()
    }
    const deletedUser = await UserRepository.deleteUserFromAdmin(id)
    return deletedUser
  },

  async fetchUsersReservationCounts(userIds) {
    return ReservationRepository.fetchUsersReservationCounts(userIds)
  },
}

export default UserService

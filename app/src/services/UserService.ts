import bcrypt from 'bcrypt'
import UserRepository from '../repositories/UserRepository'
import RoleRepository from '../repositories/RoleRepository'
import { User } from '../entities/User'
import { UserServiceInterface as UserControllerSocket } from '../controllers/userController'
import { UserServiceInterface as DashboardControllerSocket } from '../controllers/dashboardController'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type UserRepositoryInterface = {
  insertUserWithProfile(
    email: string,
    password: string,
    roleId: number,
    lastNameKanji: string,
    firstNameKanji: string,
    lastNameKana: string,
    firstNameKana: string,
    birthday: string,
    gender: string,
  ): Promise<User>,
  updateUserFromAdmin(
    id: number,
    email: string,
    roleId: number,
    lastNameKanji: string,
    firstNameKanji: string,
    lastNameKana: string,
    firstNameKana: string,
    birthday: string,
    gender: string,
  ): Promise<User>,
  deleteUserFromAdmin(id: number): Promise<User>,
  searchUser(keyword: string): Promise<User[]>,
}

export type RoleRepositoryInterface = {
  isValidRole(id: number): Promise<boolean>,
  extractValidRoleIds(roleIds: number[]): Promise<number[]>
}

const UserService: UserControllerSocket & DashboardControllerSocket = {
  async fetchUsersForDashboard() {
    const users = await UserRepository.fetchAll({ limit: 5 })
    users.forEach(user => {
      delete user.password
    })
    const totalCount = await UserRepository.totalCount()
    return { users, totalCount }
  },

  async fetchUsersWithTotalCount(params) {
    const users = await UserRepository.fetchAll(params)
    users.forEach(user => {
      delete user.password
    })
    const usersCount = await UserRepository.totalCount()
    return { values: users, totalCount: usersCount }
  },

  async searchUser(keyword) {
    const users = await UserRepository.searchUser(keyword)
    users.forEach(user => {
      delete user.password
    })
    return users
  },

  async fetchUser(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      throw new NotFoundError()
    }
    delete user.password

    return user
  },

  async insertUserFromAdmin(params) {
    if (params.password !== params.confirm) {
      throw new InvalidParamsError()
    }

    const isValidRole = await RoleRepository.isValidRole(params.roleId)
    if (!isValidRole) {
      throw new InvalidParamsError()
    }

    const duplicate = await UserRepository.fetchByEmail(params.email)
    if (duplicate) {
      throw new InvalidParamsError()
    }

    const hash = bcrypt.hashSync(params.password, 10 /* hash rounds */)

    const user = await UserRepository.insertUserWithProfile(
      params.email,
      hash,
      params.roleId,
      params.lastNameKanji,
      params.firstNameKanji,
      params.lastNameKana,
      params.firstNameKana,
      params.birthday,
      params.gender,
    )

    delete user.password

    return user
  },

  async updateUserFromAdmin({ id, params }) {
    const isValidRole = await RoleRepository.isValidRole(params.roleId)
    if (!isValidRole) {
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetch(id)
    if (!user) {
      throw new NotFoundError()
    }

    const updatedUser = await UserRepository.updateUserFromAdmin(
      id, params.email, params.roleId, params.lastNameKanji, params.firstNameKanji,
      params.lastNameKana, params.firstNameKana, params.birthday, params.gender,
    )

    delete updatedUser.password

    return updatedUser
  },

  async deleteUserFromAdmin(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      throw new NotFoundError()
    }
    const deletedUser = await UserRepository.deleteUserFromAdmin(id)
    delete deletedUser.password
    return deletedUser
  },
}

export default UserService

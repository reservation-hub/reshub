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
    roleIds: number[],
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
    lastNameKanji: string,
    firstNameKanji: string,
    lastNameKana: string,
    firstNameKana: string,
    birthday: string,
    gender: string,
    rolesToAdd: number[],
    rolesToRemove: number[],
  ): Promise<User>,
  deleteUserFromAdmin(id: number): Promise<User>
}

export type RoleRepositoryInterface = {
  extractValidRoleIds(roleIds: number[]): Promise<number[]>
}

const UserService: UserControllerSocket & DashboardControllerSocket = {
  async fetchUsersForDashboard() {
    const users = await UserRepository.fetchAll({ limit: 5 })
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

  async fetchUser(id) {
    const user = await UserRepository.fetch(id)
    if (!user) {
      throw new NotFoundError()
    }
    delete user.password

    return user
  },

  async insertUserFromAdmin(params) {
    if (params.password !== params.confirm || params.roleIds?.length === 0) {
      throw new InvalidParamsError()
    }

    const validRoleIds = await RoleRepository.extractValidRoleIds(params.roleIds)
    if (validRoleIds.length === 0) {
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
      validRoleIds,
      params.lastNameKanji,
      params.firstNameKanji,
      params.firstNameKanji,
      params.firstNameKana,
      params.birthday,
      params.gender,
    )

    delete user.password

    return user
  },

  async updateUserFromAdmin({ id, params }) {
    if (params.roleIds.length === 0) {
      throw new InvalidParamsError()
    }

    const validRoleIds = await RoleRepository.extractValidRoleIds(params.roleIds)
    if (validRoleIds.length === 0) {
      throw new InvalidParamsError()
    }

    const user = await UserRepository.fetch(id)
    if (!user) {
      throw new NotFoundError()
    }

    const userRoleIds = user.roles.map(role => role.id)
    const rolesToAdd = validRoleIds.filter(validRoleId => userRoleIds.indexOf(validRoleId) === -1)
    const rolesToRemove = userRoleIds.filter(uuid => validRoleIds.indexOf(uuid) === -1)

    const updatedUser = await UserRepository.updateUserFromAdmin(
      id, params.email, params.lastNameKanji, params.firstNameKanji,
      params.lastNameKana, params.firstNameKana, params.birthday, params.gender,
      rolesToAdd, rolesToRemove,
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

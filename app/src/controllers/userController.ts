import { User } from '@entities/User'

import {
  fetchModelsWithTotalCountQuery, fetchModelsWithTotalCountResponse,
} from '@request-response-types/ServiceCommonTypes'
import { insertUserFromAdminQuery, updateUserFromAdminQuery } from '@request-response-types/UserService'
import UserService from '@services/UserService'
import { UserControllerInterface } from '@controller-adapter/User'
import {
  userInsertSchema, userUpdateSchema,
} from './schemas/user'
import indexSchema from './schemas/indexSchema'
import { searchSchema } from './schemas/search'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(query: fetchModelsWithTotalCountQuery): Promise<fetchModelsWithTotalCountResponse<User>>,
  fetchUser(id: number): Promise<User>,
  searchUser(keyword: string): Promise<User[]>,
  insertUserFromAdmin(query: insertUserFromAdminQuery): Promise<User>,
  updateUserFromAdmin(query: updateUserFromAdminQuery): Promise<User>,
  deleteUserFromAdmin(id: number): Promise<User>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const UserController: UserControllerInterface = {
  async index(query) {
    const schemaValues = await indexSchema.validateAsync(query, joiOptions)
    return UserService.fetchUsersWithTotalCount(schemaValues)
  },

  async show(query) {
    const { id } = query
    return UserService.fetchUser(id)
  },

  async insert(query) {
    const params = await userInsertSchema.validateAsync(query, joiOptions)
    return UserService.insertUserFromAdmin(params)
  },

  async update(query) {
    const params = await userUpdateSchema.validateAsync(query.params, joiOptions)
    return UserService.updateUserFromAdmin({ id: query.id, params })
  },

  async delete(query) {
    const { id } = query
    await UserService.deleteUserFromAdmin(id)
    return { message: 'User deleted' }
  },

  async searchUsers(query) {
    const searchValues = await searchSchema.validateAsync(query, joiOptions)
    return UserService.searchUser(searchValues.keyword)
  },
}

export default UserController

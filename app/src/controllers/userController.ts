import { Gender, User } from '@entities/User'

import {
  fetchModelsWithTotalCountQuery, fetchModelsWithTotalCountResponse,
} from '@request-response-types/ServiceCommonTypes'
import { User as UserEndpointUser } from '@request-response-types/User'
import UserService from '@services/UserService'
import { UserControllerInterface } from '@controller-adapter/User'
import { RoleSlug } from '@entities/Role'
import {
  userInsertSchema, userUpdateSchema,
} from './schemas/user'
import indexSchema from './schemas/indexSchema'
import { searchSchema } from './schemas/search'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(query: fetchModelsWithTotalCountQuery): Promise<fetchModelsWithTotalCountResponse<User>>,
  fetchUser(id: number): Promise<User>,
  searchUser(keyword: string): Promise<User[]>,
  insertUserFromAdmin(password: string, confirm: string, email: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, gender: Gender, birthday: string)
    : Promise<User>,
  updateUserFromAdmin(id: number, email: string, roleSlug: RoleSlug, lastNameKanji: string, firstNameKanji: string,
    lastNameKana: string, firstNameKana: string, gender: Gender, birthday: string) : Promise<User>,
  deleteUserFromAdmin(id: number): Promise<User>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const reconstructUserFromEntity = (u: User, reservationCount: number): UserEndpointUser => ({
  id: u.id,
  username: u.username,
  email: u.email,
  role: u.role,
  lastNameKana: u.lastNameKana,
  firstNameKana: u.firstNameKana,
  birthday: u.birthday,
  gender: u.gender,
  reservationCount,
})

const UserController: UserControllerInterface = {
  async index(query) {
    const schemaValues = await indexSchema.validateAsync(query, joiOptions)
    const { values: users, totalCount } = await UserService.fetchUsersWithTotalCount(schemaValues)
    const userReservationCounts = await UserService.fetchUsersReservationCounts(users.map(u => u.id))
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      lastNameKana: u.lastNameKana,
      firstNameKana: u.firstNameKana,
      reservationCount: userReservationCounts.find(urc => urc.userId === u.id)!.reservationCount,
    }))
    return { values: userList, totalCount }
  },

  async show(query) {
    const { id } = query
    const user = await UserService.fetchUser(id)
    const userReservationCount = await UserService.fetchUsersReservationCounts([user.id])
    return reconstructUserFromEntity(user, userReservationCount[0].reservationCount)
  },

  async insert(query) {
    const {
      password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, birthday,
    } = await userInsertSchema.validateAsync(query, joiOptions)
    const user = await UserService.insertUserFromAdmin(password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, birthday)
    return reconstructUserFromEntity(user, 0)
  },

  async update(query) {
    const {
      email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday,
    } = await userUpdateSchema.validateAsync(query.params, joiOptions)
    const user = await UserService.updateUserFromAdmin(query.id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday)
    const reservationCount = await UserService.fetchUsersReservationCounts([user.id])
    return reconstructUserFromEntity(user, reservationCount[0].reservationCount)
  },

  async delete(query) {
    const { id } = query
    await UserService.deleteUserFromAdmin(id)
    return { message: 'User deleted' }
  },

  async searchUsers(query) {
    const searchValues = await searchSchema.validateAsync(query, joiOptions)
    const users = await UserService.searchUser(searchValues.keyword)
    const userReservationCounts = await UserService.fetchUsersReservationCounts(users.map(u => u.id))
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      lastNameKana: u.lastNameKana,
      firstNameKana: u.firstNameKana,
      reservationCount: userReservationCounts.find(urc => urc.userId === u.id)!.reservationCount,
    }))
    return { values: userList, totalCount: users.length }
  },
}

export default UserController

import { UserControllerInterface } from '@controller-adapter/User'
import { Gender, User } from '@entities/User'
import { RoleSlug } from '@entities/Role'
import UserService from '@user/services/UserService'
import {
  userInsertSchema, userUpdateSchema, indexSchema, searchSchema,
} from '@user/schemas'
import { OrderBy } from '@entities/Common'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(page?: number, order?: OrderBy): Promise<{ users: User[], totalCount: number}>
  fetchUser(id: number): Promise<User>
  searchUser(keyword: string): Promise<User[]>
  insertUser(password: string, confirm: string, email: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, gender: Gender, birthday: string)
    : Promise<void>
  updateUser(id: number, email: string, roleSlug: RoleSlug, lastNameKanji: string, firstNameKanji: string,
    lastNameKana: string, firstNameKana: string, gender: Gender, birthday: string) : Promise<void>
  deleteUser(id: number): Promise<void>
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const UserController: UserControllerInterface = {
  async index(query) {
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { users, totalCount } = await UserService.fetchUsersWithTotalCount(page, order)
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
    const u = await UserService.fetchUser(id)
    const userReservationCount = await UserService.fetchUsersReservationCounts([u.id])
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      lastNameKana: u.lastNameKana,
      firstNameKana: u.firstNameKana,
      birthday: u.birthday,
      gender: u.gender,
      reservationCount: userReservationCount[0].reservationCount,
    }
  },

  async insert(query) {
    const {
      password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, birthday,
    } = await userInsertSchema.validateAsync(query, joiOptions)
    await UserService.insertUser(password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, birthday)
    return 'User created'
  },

  async update(query) {
    const {
      email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday,
    } = await userUpdateSchema.validateAsync(query.params, joiOptions)
    await UserService.updateUser(query.id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday)
    return 'User updated'
  },

  async delete(query) {
    const { id } = query
    await UserService.deleteUser(id)
    return 'User deleted'
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

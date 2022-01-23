import { UserControllerInterface } from '@controller-adapter/User'
import { Gender, User } from '@entities/User'
import { RoleSlug } from '@entities/Role'
import UserService from '@user/services/UserService'
import {
  userInsertSchema, userUpdateSchema, indexSchema, searchSchema, userPasswordUpdateSchema,
} from '@user/schemas'
import { OrderBy } from '@entities/Common'
import { convertDateObjectToOutboundDateString, convertDateStringToDateObject } from '@lib/Date'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(page?: number, order?: OrderBy): Promise<{ users: User[], totalCount: number}>
  fetchUser(id: number): Promise<User>
  searchUser(keyword: string, page?: number, order?: OrderBy): Promise<User[]>
  insertUser(password: string, confirm: string, email: string, roleSlug: RoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, gender: Gender, birthday: Date)
    : Promise<void>
  updateUser(id: number, email: string, roleSlug: RoleSlug, lastNameKanji: string, firstNameKanji: string,
    lastNameKana: string, firstNameKana: string, gender: Gender, birthday: Date) : Promise<void>
  updateUserPassword(id: number, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<void>
  deleteUser(id: number): Promise<void>
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const UserController: UserControllerInterface = {
  async index(query) {
    const { page, order } = await indexSchema.parseAsync(query)
    const { users, totalCount } = await UserService.fetchUsersWithTotalCount(page, order)
    const userReservationCounts = await UserService.fetchUsersReservationCounts(users.map(u => u.id))
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: {
        slug: u.role.slug,
        name: u.role.name,
      },
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
      role: {
        slug: u.role.slug,
        name: u.role.name,
      },
      lastNameKana: u.lastNameKana,
      firstNameKana: u.firstNameKana,
      birthday: u.birthday ? convertDateObjectToOutboundDateString(u.birthday) : undefined,
      gender: u.gender,
      reservationCount: userReservationCount[0].reservationCount,
    }
  },

  async insert(query) {
    const {
      password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, birthday,
    } = await userInsertSchema.parseAsync(query)
    const dateObject = convertDateStringToDateObject(birthday)
    await UserService.insertUser(password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, dateObject)
    return 'User created'
  },

  async update(query) {
    const {
      email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday,
    } = await userUpdateSchema.parseAsync(query.params)
    const dateObject = convertDateStringToDateObject(birthday)
    await UserService.updateUser(query.id, email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, dateObject)
    return 'User updated'
  },

  async updatePassword(query) {
    const { id } = query
    const {
      oldPassword, newPassword, confirmNewPassword,
    } = await userPasswordUpdateSchema.parseAsync(query.params)
    await UserService.updateUserPassword(id, oldPassword, newPassword, confirmNewPassword)
    return 'User password updated'
  },

  async delete(query) {
    const { id } = query
    await UserService.deleteUser(id)
    return 'User deleted'
  },

  async searchUsers(query) {
    const { keyword, page, order } = await searchSchema.parseAsync(query)
    const users = await UserService.searchUser(keyword, page, order)
    const userReservationCounts = await UserService.fetchUsersReservationCounts(users.map(u => u.id))
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: {
        slug: u.role.slug,
        name: u.role.name,
      },
      lastNameKana: u.lastNameKana,
      firstNameKana: u.firstNameKana,
      reservationCount: userReservationCounts.find(urc => urc.userId === u.id)!.reservationCount,
    }))
    return { values: userList, totalCount: users.length }
  },
}

export default UserController

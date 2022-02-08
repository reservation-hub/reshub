import { UserControllerInterface } from '@controller-adapter/User'
import { Gender as EntityGender, User as EntityUser } from '@entities/User'
import { User } from '@request-response-types/models/User'
import { RoleSlug as EntityRoleSlug } from '@entities/Role'
import UserService from '@user/services/UserService'
import {
  userInsertSchema, userUpdateSchema, indexSchema, searchSchema, userPasswordUpdateSchema,
} from '@user/schemas'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import { convertDateObjectToOutboundDateString, convertDateStringToDateObject } from '@lib/Date'
import {
  convertEntityGenderToDTO, convertEntityRoleSlugToDTO, convertGenderToEntity,
  convertRoleSlugToEntity,
} from '@dtoConverters/User'
import { convertOrderByToEntity } from '@dtoConverters/Common'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ users: EntityUser[], totalCount: number}>
  fetchUser(id: number): Promise<EntityUser>
  searchUser(keyword: string, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ users: EntityUser[], totalCount: number}>
  insertUser(password: string, confirm: string, email: string, roleSlug: EntityRoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, gender: EntityGender, birthday: Date)
    : Promise<EntityUser>
  updateUser(id: number, email: string, roleSlug: EntityRoleSlug, lastNameKanji: string, firstNameKanji: string,
    lastNameKana: string, firstNameKana: string, gender: EntityGender, birthday: Date) : Promise<EntityUser>
  updateUserPassword(id: number, oldPassword: string, newPassword: string, confirmNewPassword: string)
    : Promise<EntityUser>
  deleteUser(id: number): Promise<EntityUser>
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const reconstructUser = async (u: EntityUser): Promise<User> => {
  const userReservationCount = await UserService.fetchUsersReservationCounts([u.id])
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: {
      slug: convertEntityRoleSlugToDTO(u.role.slug),
      name: u.role.name,
    },
    lastNameKana: u.lastNameKana,
    firstNameKana: u.firstNameKana,
    birthday: u.birthday ? convertDateObjectToOutboundDateString(u.birthday) : undefined,
    gender: u.gender ? convertEntityGenderToDTO(u.gender) : undefined,
    reservationCount: userReservationCount[0].reservationCount,
  }
}

const UserController: UserControllerInterface = {
  async index(query) {
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { users, totalCount } = await UserService.fetchUsersWithTotalCount(
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    const userReservationCounts = await UserService.fetchUsersReservationCounts(users.map(u => u.id))
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: {
        slug: convertEntityRoleSlugToDTO(u.role.slug),
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
    const user = await UserService.fetchUser(id)
    return reconstructUser(user)
  },

  async insert(query) {
    const {
      password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, birthday,
    } = await userInsertSchema.parseAsync(query)
    const dateObject = convertDateStringToDateObject(birthday)
    const user = await UserService.insertUser(password, confirm, email, convertRoleSlugToEntity(roleSlug),
      lastNameKanji, firstNameKanji, lastNameKana, firstNameKana, convertGenderToEntity(gender), dateObject)
    return reconstructUser(user)
  },

  async update(query) {
    const {
      email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday,
    } = await userUpdateSchema.parseAsync(query.params)
    const dateObject = convertDateStringToDateObject(birthday)
    const user = await UserService.updateUser(query.id, email, convertRoleSlugToEntity(roleSlug),
      lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, convertGenderToEntity(gender), dateObject)
    return reconstructUser(user)
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
    const user = await UserService.deleteUser(id)
    return reconstructUser(user)
  },

  async searchUsers(query) {
    const {
      keyword, page, order, take,
    } = await searchSchema.parseAsync(query)
    const { users, totalCount } = await UserService.searchUser(
      keyword,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
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
}

export default UserController

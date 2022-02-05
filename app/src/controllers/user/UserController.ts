import { UserControllerInterface } from '@controller-adapter/User'
import { Gender as EntityGender, User } from '@entities/User'
import { RoleSlug as EntityRoleSlug } from '@entities/Role'
import { RoleSlug } from '@request-response-types/models/Role'
import UserService from '@user/services/UserService'
import {
  userInsertSchema, userUpdateSchema, indexSchema, searchSchema, userPasswordUpdateSchema,
} from '@user/schemas'
import { Gender } from '@request-response-types/models/User'
import { OrderBy } from '@request-response-types/Common'
import { OrderBy as EntityOrderBy } from '@entities/Common'
import { convertDateObjectToOutboundDateString, convertDateStringToDateObject } from '@lib/Date'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ users: User[], totalCount: number}>
  fetchUser(id: number): Promise<User>
  searchUser(keyword: string, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ users: User[], totalCount: number}>
  insertUser(password: string, confirm: string, email: string, roleSlug: EntityRoleSlug, lastNameKanji: string,
    firstNameKanji: string, lastNameKana: string, firstNameKana: string, gender: EntityGender, birthday: Date)
    : Promise<User>
  updateUser(id: number, email: string, roleSlug: EntityRoleSlug, lastNameKanji: string, firstNameKanji: string,
    lastNameKana: string, firstNameKana: string, gender: EntityGender, birthday: Date) : Promise<User>
  updateUserPassword(id: number, oldPassword: string, newPassword: string, confirmNewPassword: string): Promise<User>
  deleteUser(id: number): Promise<User>
  fetchUsersReservationCounts(userIds: number[]): Promise<{ userId: number, reservationCount: number }[]>
}

const convertOrderByToEntity = (order: OrderBy): EntityOrderBy => {
  switch (order) {
    case OrderBy.ASC:
      return EntityOrderBy.ASC
    default:
      return EntityOrderBy.DESC
  }
}

const convertEntityGenderToDTO = (gender: EntityGender): Gender => {
  switch (gender) {
    case EntityGender.FEMALE:
      return Gender.FEMALE
    default:
      return Gender.MALE
  }
}

const convertGenderToEntity = (gender: Gender): EntityGender => {
  switch (gender) {
    case Gender.FEMALE:
      return EntityGender.FEMALE
    default:
      return EntityGender.MALE
  }
}

const convertEntityRoleSlugToDTO = (slug: EntityRoleSlug): RoleSlug => {
  switch (slug) {
    case EntityRoleSlug.ADMIN:
      return RoleSlug.ADMIN
    case EntityRoleSlug.SHOP_STAFF:
      return RoleSlug.SHOP_STAFF
    default:
      return RoleSlug.CLIENT
  }
}

const convertRoleSlugToEntity = (slug: RoleSlug): EntityRoleSlug => {
  switch (slug) {
    case RoleSlug.ADMIN:
      return EntityRoleSlug.ADMIN
    case RoleSlug.SHOP_STAFF:
      return EntityRoleSlug.SHOP_STAFF
    default:
      return EntityRoleSlug.CLIENT
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
    const u = await UserService.fetchUser(id)
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
  },

  async insert(query) {
    const {
      password, confirm, email, roleSlug, lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, gender, birthday,
    } = await userInsertSchema.parseAsync(query)
    const dateObject = convertDateStringToDateObject(birthday)
    await UserService.insertUser(password, confirm, email, convertRoleSlugToEntity(roleSlug), lastNameKanji,
      firstNameKanji, lastNameKana, firstNameKana, convertGenderToEntity(gender), dateObject)
    return 'User created'
  },

  async update(query) {
    const {
      email, roleSlug, lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, gender, birthday,
    } = await userUpdateSchema.parseAsync(query.params)
    const dateObject = convertDateStringToDateObject(birthday)
    await UserService.updateUser(query.id, email, convertRoleSlugToEntity(roleSlug), lastNameKanji, firstNameKanji,
      lastNameKana, firstNameKana, convertGenderToEntity(gender), dateObject)
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

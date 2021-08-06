import UserRepository from '../repositories/UserRepository'
import RoleRepository from '../repositories/RoleRepository'
import { User } from '../entities/User'
import { UserServiceInterface } from '../controllers/userController'
import { fetchModelsWithTotalCountQuery } from './ServiceCommonTypes'
import { InvalidParamsError, NotFoundError } from './Errors/ServiceError'

export type UserRepositoryInterface = {
  insertUserWithProfile(
    email: string,
    password: string,
    roleIDs: number[],
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
    password: string,
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
  extractValidRoleIDs(roleIDs: number[]): Promise<number[]>
}

export type insertUserFromAdminQuery = {
  password: string
  confirm: string,
  email: string,
  roleIDs: number[],
  lastNameKanji: string,
  firstNameKanji: string,
  lastNameKana: string,
  firstNameKana: string,
  gender: string,
  birthday: string,
}

export type updateUserFromAdminQuery = {
  password: string
  confirm: string,
  email: string,
  roleIDs: number[],
  lastNameKanji: string,
  firstNameKanji: string,
  lastNameKana: string,
  firstNameKana: string,
  gender: string,
  birthday: string,
}

export const fetchUsersWithTotalCount = async (query: fetchModelsWithTotalCountQuery)
:Promise<{ data: User[], totalCount: number }> => {
  const users = await UserRepository.fetchAll(query.page, query.order)
  users.forEach(user => {
    delete user.password
  })
  const usersCount = await UserRepository.totalCount()
  return { data: users, totalCount: usersCount }
}

export const fetchUser = async (id: number): Promise<User> => {
  const user = await UserRepository.fetch(id)
  if (!user) {
    throw new NotFoundError()
  }
  delete user.password

  return user
}

export const insertUserFromAdmin = async (query: insertUserFromAdminQuery): Promise<User> => {
  if (query.password !== query.confirm || query.roleIDs?.length === 0) {
    throw new InvalidParamsError()
  }

  const validRoleIDs = await RoleRepository.extractValidRoleIDs(query.roleIDs)
  if (validRoleIDs.length === 0) {
    throw new InvalidParamsError()
  }

  const user = await UserRepository.insertUserWithProfile(
    query.email,
    query.password,
    validRoleIDs,
    query.lastNameKanji,
    query.firstNameKanji,
    query.firstNameKanji,
    query.firstNameKana,
    query.birthday,
    query.gender,
  )

  delete user.password

  return user
}

export const updateUserFromAdmin = async (id: number, query: updateUserFromAdminQuery)
: Promise<User> => {
  if (query.roleIDs.length === 0) {
    throw new InvalidParamsError()
  }

  const validRoleIDs = await RoleRepository.extractValidRoleIDs(query.roleIDs)
  if (validRoleIDs.length === 0) {
    throw new InvalidParamsError()
  }

  const user = await UserRepository.fetch(id)
  if (!user) {
    throw new NotFoundError()
  }

  const userRoleIDs = user.roles.map(role => role.id)
  const rolesToAdd = validRoleIDs.filter(validRoleID => userRoleIDs.indexOf(validRoleID) === -1)
  const rolesToRemove = userRoleIDs.filter(uuid => validRoleIDs.indexOf(uuid) === -1)

  const updatedUser = await UserRepository.updateUserFromAdmin(
    id, query.email, query.password, query.lastNameKanji, query.firstNameKanji,
    query.lastNameKana, query.firstNameKana, query.birthday, query.gender,
    rolesToAdd, rolesToRemove,
  )

  delete updatedUser.password

  return updatedUser
}

export const deleteUserFromAdmin = async (id: number): Promise<User> => {
  const user = await UserRepository.fetch(id)
  if (!user) {
    throw new NotFoundError()
  }
  const deletedUser = await UserRepository.deleteUserFromAdmin(id)
  delete deletedUser.password
  return deletedUser
}

const UserService: UserServiceInterface = {
  fetchUsersWithTotalCount,
  fetchUser,
  insertUserFromAdmin,
  updateUserFromAdmin,
  deleteUserFromAdmin,
}

export default UserService

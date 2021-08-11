import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { parseIntIdMiddleware, roleCheck } from '../routes/utils'
import {
  userInsertSchema, userUpdateSchema,
} from './schemas/user'
import indexSchema from './schemas/indexSchema'
import { fetchModelsWithTotalCountQuery } from '../services/ServiceCommonTypes'
import UserService, {
  insertUserFromAdminQuery,
  updateUserFromAdminQuery,
} from '../services/UserService'
import {
  User, Female, Male, Gender,
} from '../entities/User'

export type UserServiceInterface = {
  fetchUsersWithTotalCount(query: fetchModelsWithTotalCountQuery): Promise<{ data: User[], totalCount: number }>,
  fetchUser(id: number): Promise<User>,
  insertUserFromAdmin(query: insertUserFromAdminQuery): Promise<User>,
  updateUserFromAdmin(id: number, query: updateUserFromAdminQuery): Promise<User>,
  deleteUserFromAdmin(id: number): Promise<User>,
}

const joiOptions = { abortEarly: false, stripUnknown: true }

const convertDBGenderToEntityGender = (gender: string): Gender => {
  switch (gender) {
    case '1':
      return Female
    default:
      return Male
  }
}

export const index = asyncHandler(async (req, res) => {
  const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)

  const usersWithCount = await UserService.fetchUsersWithTotalCount(schemaValues)

  return res.send(usersWithCount)
})

export const showUser = asyncHandler(async (req, res) => {
  const { id } = res.locals
  const user = await UserService.fetchUser(id)
  return res.send(user)
})

export const insertUser = asyncHandler(async (req, res) => {
  const userValues = await userInsertSchema.validateAsync(req.body, joiOptions)

  const user = await UserService.insertUserFromAdmin(userValues)
  if (user.gender) {
    user.gender = convertDBGenderToEntityGender(user.gender)
  }

  return res.send(user)
})

export const updateUser = asyncHandler(async (req, res) => {
  const userValues = await userUpdateSchema.validateAsync(req.body, joiOptions)

  const { id } = res.locals

  const user = await UserService.updateUserFromAdmin(id, userValues)

  if (user.gender) {
    user.gender = convertDBGenderToEntityGender(user.gender)
  }

  return res.send(user)
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = res.locals
  await UserService.deleteUserFromAdmin(id)
  return res.send({ message: 'User deleted' })
})

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showUser)
routes.post('/', roleCheck(['admin']), insertUser)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateUser)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteUser)

export default routes

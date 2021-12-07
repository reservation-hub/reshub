import {
  Router, Request, Response, NextFunction,
} from 'express'
import { User } from '@entities/User'
import { parseIntIdMiddleware, roleCheck } from '@routes/utils'
import {
  fetchModelsWithTotalCountQuery, fetchModelsWithTotalCountResponse,
} from '@request-response-types/ServiceCommonTypes'
import { insertUserFromAdminQuery, updateUserFromAdminQuery } from '@request-response-types/UserService'
import UserService from '@services/UserService'
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

export const searchUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const searchValues = await searchSchema.validateAsync(req.body, joiOptions)
    const user = await UserService.searchUser(searchValues.keyword)

    return res.send({ data: user })
  } catch (e) { return next(e) }
}

export const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const schemaValues = await indexSchema.validateAsync(req.query, joiOptions)

    const usersWithCount = await UserService.fetchUsersWithTotalCount(schemaValues)

    return res.send(usersWithCount)
  } catch (e) { return next(e) }
}

export const showUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    const user = await UserService.fetchUser(id)
    return res.send(user)
  } catch (e) { return next(e) }
}

export const insertUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await userInsertSchema.validateAsync(req.body, joiOptions)

    const user = await UserService.insertUserFromAdmin(params)

    return res.send(user)
  } catch (e) { return next(e) }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const params = await userUpdateSchema.validateAsync(req.body, joiOptions)

    const { id } = res.locals

    const user = await UserService.updateUserFromAdmin({ id, params })

    return res.send(user)
  } catch (e) { return next(e) }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    await UserService.deleteUserFromAdmin(id)
    return res.send({ message: 'User deleted' })
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showUser)
routes.post('/', roleCheck(['admin']), insertUser)
routes.post('/search', searchUser)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateUser)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteUser)

export default routes

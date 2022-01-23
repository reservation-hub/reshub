import {
  Request, Response, NextFunction, Router,
} from 'express'
import UserController from '@user/UserController'
import { parseIntIdMiddleware, roleCheck } from '@routes/utils'
import { RoleSlug } from '@entities/Role'
import {
  UserListQuery, UserListResponse, UserQuery, UserResponse,
  InsertUserQuery, UpdateUserQuery, deleteUserQuery, userSearchQuery, UpdateUserPasswordQuery,
} from '@request-response-types/User'
import { ResponseMessage } from '@request-response-types/Common'
import parseToInt from '@lib/ParseInt'

export type UserControllerInterface = {
  index(query: UserListQuery): Promise<UserListResponse>
  show(query: UserQuery): Promise<UserResponse>
  insert(query: InsertUserQuery): Promise<ResponseMessage>
  update(query: UpdateUserQuery): Promise<ResponseMessage>
  updatePassword(query: UpdateUserPasswordQuery): Promise<ResponseMessage>
  delete(query: deleteUserQuery): Promise<ResponseMessage>
  searchUsers(query: userSearchQuery): Promise<UserListResponse>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    return res.send(await UserController.index({ page: parseToInt(page), order }))
  } catch (e) { return next(e) }
}

const showUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await UserController.show({ id }))
  } catch (e) { return next(e) }
}

const insertUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await UserController.insert(body))
  } catch (e) { return next(e) }
}

const updateUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { id } = res.locals
    return res.send(await UserController.update({ id, params }))
  } catch (e) { return next(e) }
}

const updateUserPassword = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { id } = res.locals
    return res.send(await UserController.updatePassword({ id, params }))
  } catch (e) { return next(e) }
}

const deleteUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await UserController.delete({ id }))
  } catch (e) { return next(e) }
}

const searchUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { query } = req
    return res.send(await UserController.searchUsers(query))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), index)
routes.get('/search', roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]), searchUser)
routes.get('/:id', roleCheck([RoleSlug.ADMIN]), parseIntIdMiddleware, showUser)
routes.post('/', roleCheck([RoleSlug.ADMIN]), insertUser)
routes.patch('/:id', roleCheck([RoleSlug.ADMIN]), parseIntIdMiddleware, updateUser)
routes.patch('/:id/password', roleCheck([RoleSlug.ADMIN, RoleSlug.SHOP_STAFF]),
  parseIntIdMiddleware, updateUserPassword)
routes.delete('/:id', roleCheck([RoleSlug.ADMIN]), parseIntIdMiddleware, deleteUser)

export default routes

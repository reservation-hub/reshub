import {
  Request, Response, NextFunction, Router,
} from 'express'
import userController from '@controllers/userController'
import { parseIntIdMiddleware, roleCheck } from '@routes/utils'
import { RoleSlug } from '@entities/Role'
import {
  UserListQuery, UserListResponse, UserQuery, UserResponse,
  InsertUserQuery, UpdateUserQuery, deleteUserQuery, userSearchQuery,
} from '@request-response-types/User'
import { ResponseMessage } from '@request-response-types/Common'

export type UserControllerInterface = {
  index(query: UserListQuery): Promise<UserListResponse>
  show(query: UserQuery): Promise<UserResponse>
  insert(query: InsertUserQuery): Promise<ResponseMessage>
  update(query: UpdateUserQuery): Promise<ResponseMessage>
  delete(query: deleteUserQuery): Promise<ResponseMessage>
  searchUsers(query: userSearchQuery): Promise<UserListResponse>
}

const index = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { page, order } = req.query
    return res.send(await userController.index({ page, order }))
  } catch (e) { return next(e) }
}

const showUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await userController.show({ id }))
  } catch (e) { return next(e) }
}

const insertUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await userController.insert(body))
  } catch (e) { return next(e) }
}

const updateUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body: params } = req
    const { id } = res.locals
    return res.send(await userController.update({ id, params }))
  } catch (e) { return next(e) }
}

const deleteUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { id } = res.locals
    return res.send(await userController.delete({ id }))
  } catch (e) { return next(e) }
}

const searchUser = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await userController.searchUsers(body))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.get('/', roleCheck([RoleSlug.ADMIN]), index)
routes.get('/:id', roleCheck([RoleSlug.ADMIN]), parseIntIdMiddleware, showUser)
routes.post('/', roleCheck([RoleSlug.ADMIN]), insertUser)
routes.post('/search', searchUser)
routes.patch('/:id', roleCheck([RoleSlug.ADMIN]), parseIntIdMiddleware, updateUser)
routes.delete('/:id', roleCheck([RoleSlug.ADMIN]), parseIntIdMiddleware, deleteUser)

export default routes

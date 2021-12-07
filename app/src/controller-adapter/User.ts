import {
  Request, Response, NextFunction, Router,
} from 'express'
import userController from '@controllers/userController'
import { parseIntIdMiddleware, roleCheck } from '@routes/utils'
import {
  deleteUserQuery,
  insertUserQuery,
  updateUserQuery,
  userQuery, userResponse, userSearchQuery, userSearchResponse, usersResponse, usersWithCountQuery,
} from '@request-response-types/User'

export type UserControllerInterface = {
  index(query: usersWithCountQuery): Promise<usersResponse>
  show(query: userQuery): Promise<userResponse>
  insert(query: insertUserQuery): Promise<userResponse>
  update(query: updateUserQuery): Promise<userResponse>
  delete(query: deleteUserQuery): Promise<{ message: string }>
  searchUsers(query: userSearchQuery): Promise<userSearchResponse>
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

routes.get('/', roleCheck(['admin']), index)
routes.get('/:id', roleCheck(['admin']), parseIntIdMiddleware, showUser)
routes.post('/', roleCheck(['admin']), insertUser)
routes.post('/search', searchUser)
routes.patch('/:id', roleCheck(['admin']), parseIntIdMiddleware, updateUser)
routes.delete('/:id', roleCheck(['admin']), parseIntIdMiddleware, deleteUser)

export default routes

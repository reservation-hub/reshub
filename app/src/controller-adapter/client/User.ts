import {
  Request, Response, NextFunction, Router,
} from 'express'
import { ResponseMessage } from '@request-response-types/Common'
import { InsertUserQuery, UpdateUserQuery, UpdateUserPasswordQuery } from '@request-response-types/client/User'
import UserController from '@client/user/UserController'
import { UserForAuth } from '@entities/User'
import { protectClientRoute } from '@routes/utils'
import { verifyIfNotLoggedInYet } from './Auth'

export type UserControllerInterface = {
  signUp(query: InsertUserQuery): Promise<ResponseMessage>
  update(user: UserForAuth | undefined, query: UpdateUserQuery): Promise<ResponseMessage>
  updatePassword(user: UserForAuth | undefined, query: UpdateUserPasswordQuery): Promise<ResponseMessage>
}

export type ReservationControllerInterface = {
  userReservationsList(user: UserForAuth | undefined, query: UpdateUserQuery): Promise<ResponseMessage>
}

const signUp = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await UserController.signUp(body))
  } catch (e) { return next(e) }
}

const update = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { user, body } = req
    return res.send(await UserController.update(user, body))
  } catch (e) { return next(e) }
}

const updateUserPassword = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body, user } = req
    return res.send(await UserController.updatePassword(user, body))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.post('/create', verifyIfNotLoggedInYet, signUp)
routes.patch('/', protectClientRoute, update)
routes.patch('/password', protectClientRoute, updateUserPassword)

export default routes

import {
  Request, Response, NextFunction, Router,
} from 'express'
import { ResponseMessage } from '@request-response-types/Common'
import { InsertUserQuery } from '@request-response-types/client/User'
import UserController from '@client/user/UserController'
import { verifyIfNotLoggedInYet } from './Auth'

export type UserControllerInterface = {
  signUp(query: InsertUserQuery): Promise<ResponseMessage>
}

const signUp = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const { body } = req
    return res.send(await UserController.signUp(body))
  } catch (e) { return next(e) }
}

const routes = Router()

routes.use('/create', verifyIfNotLoggedInYet, signUp)

export default routes

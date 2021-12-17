import {
  Router, Response, Request, NextFunction,
} from 'express'

import { User } from '@entities/User'
import { verifyIfNotLoggedInYet } from '@controller-adapter/Auth'
import SignUpService, { signUpQuery } from '@client/services/SignUpService'
import { signUpSchema } from './schemas/signup'

const joiOptions = { abortEarly: false, stripUnknown: true }

export type SignUpServiceInterface = {
  signUpUser(query: signUpQuery): Promise<User>
}

// validate the signUp values with joi schema
export const signUp = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
  try {
    const userValues = await signUpSchema.validateAsync(req.body, joiOptions)
    const user = await SignUpService.signUpUser(userValues)
    return res.send({ data: user })
  } catch (e) { return next(e) }
}

const routes = Router()

routes.post('/', verifyIfNotLoggedInYet, signUp)

export default routes

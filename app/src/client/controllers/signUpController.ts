import { Router } from 'express'
import asyncHandler from 'express-async-handler'

import { signUpSchema } from './schemas/signup'
import SignUpService, { signUpQuery } from '../services/SignUpService'
import { User } from '../../entities/User'
import { verifyIfNotLoggedInYet } from '../../controllers/authController'

const joiOptions = { abortEarly: false, stripUnknown: true }

export type SignUpServiceInterface = {
  signUpUser(query: signUpQuery): Promise<User>
}

// validate the signUp values with joi schema
export const signUp = asyncHandler(async (req, res) => {
  const userValues = await signUpSchema.validateAsync(req.body, joiOptions)

  const user = await SignUpService.signUpUser(userValues)
  res.send({ data: user })
})

const routes = Router()

routes.post('/', verifyIfNotLoggedInYet, signUp)

export default routes

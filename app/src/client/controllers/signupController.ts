import asyncHandler from 'express-async-handler'

import { signUpSchema } from './schemas/signup'
import SignUpService, { signUpQuery } from '../services/SignUpService'
import { User } from '../../entities/User'

// const { mailController } = require('./lib/mailController')

const joiOptions = { abortEarly: false, stripUnknown: true }

export type SignUpServiceInterface = {
  signUpUser(query: signUpQuery): Promise<User>
}

// validate the signup values with joi schema
export const signup = asyncHandler(async (req, res) => {
  const userValues = await signUpSchema.validateAsync(req.body, joiOptions)

  const user = await SignUpService.signUpUser(userValues)
  return res.send({ data: user })
})

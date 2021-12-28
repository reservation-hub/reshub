import Joi from 'joi'

export const signUpSchema = Joi.object({
  username: Joi.string().trim().alphanum().required(),
  password: Joi.string().trim().alphanum().required(),
  confirm: Joi.string().trim().alphanum().required(),
  email: Joi.string().email().trim().required(),
})
